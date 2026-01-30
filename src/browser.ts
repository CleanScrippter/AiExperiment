import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { config } from './config';

export class ChatbotBrowser {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    async init() {
        // We use a persistent context if we want to reuse session/cookies easily
        // But for this experimental setup, we launch a standard browser.
        this.browser = await chromium.launch({ headless: false });
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        this.page = await this.context.newPage();
        await this.page.goto(config.CHATBOT_URL);
        console.log(`Navigated to ${config.CHATBOT_URL}`);
    }

    async waitForStreamingComplete() {
        if (!this.page) throw new Error('Browser not initialized');

        // Gemini specific: the "send" button icon changes or the button becomes enabled/disabled.
        // Also, the "stop" button (square) appears during generation.
        try {
            // Wait for the stop button to disappear if it exists
            const stopButtonSelector = 'button[aria-label="Stop response"], .stop-button-class'; // Heuristic
            await this.page.waitForSelector(stopButtonSelector, { state: 'hidden', timeout: 5000 }).catch(() => { });

            // Wait for the send button to be visible and not have a "stop" state
            // In Gemini, the send button is often a <button> inside the input area
            await this.page.waitForSelector('button[aria-label*="Send"]', { state: 'visible', timeout: 60000 });

            // Reduce buffer to 2 seconds for faster response
            await this.page.waitForTimeout(6000);
        } catch (e) {
            console.warn("Timeout waiting for streaming completion, proceeding anyway.");
        }
    }

    async getLatestResponse(): Promise<string> {
        if (!this.page) throw new Error('Browser not initialized');

        // Gemini DOM structure:
        // Responses are usually inside <message-content> or divs with specific classes.
        // We'll look for the last 'model-response' or similar.
        const response = await this.page.$$eval('.model-response-text, .message-content, .markdown', (elements) => {
            return elements
                .filter(e => e instanceof HTMLElement)
                .map(e => (e as HTMLElement).innerText.trim())
                .filter(t => t.length > 0);
        });

        return response[response.length - 1] || '';
    }

    async sendMessage(text: string) {
        if (!this.page) throw new Error('Browser not initialized');

        // Gemini uses a contenteditable div inside rich-textarea
        const inputSelector = 'div[contenteditable="true"][role="textbox"]';
        const input = await this.page.waitForSelector(inputSelector);

        await input.click();
        await input.focus();

        // Clear existing content (sometimes Gemini has placeholders)
        // Using textContent instead of innerHTML to satisfy Trusted Types policies
        await this.page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el instanceof HTMLElement) el.textContent = '';
        }, inputSelector);

        // Human-like typing into contenteditable
        for (const char of text) {
            await this.page.keyboard.type(char, { delay: Math.random() * 10 + 5 });
        }

        // Press Enter to send
        await this.page.keyboard.press('Enter');

        // Brief wait to see if the message was sent (input cleared or streaming started)
        await this.page.waitForTimeout(500);

        // Fallback: click the send button ONLY if it's still visible and still labeled as "Send"
        // This prevents clicking the "Stop" button which often replaces the "Send" button
        const sendButton = await this.page.$('button[aria-label*="Send message"]');
        if (sendButton) {
            const isVisible = await sendButton.isVisible();
            const label = await sendButton.getAttribute('aria-label');
            if (isVisible && label && label.includes('Send')) {
                await sendButton.click();
            }
        }
    }

    async close() {
        await this.browser?.close();
    }
}
