import { ChatbotBrowser } from './browser';
import { MediatorAI } from './mediator';
import { Logger } from './logger';
import { config } from './config';

export class Orchestrator {
    private browser: ChatbotBrowser;
    private mediator: MediatorAI;
    private logger: Logger;

    constructor() {
        this.browser = new ChatbotBrowser();
        this.mediator = new MediatorAI();
        this.logger = new Logger();
    }

    async start() {
        await this.browser.init();

        let currentInput = "hi!how are you?Lets talk in less than 50 words.";
        let turn = 1;

        while (turn <= config.MAX_TURNS) {
            console.log(`\n--- Turn ${turn} ---`);

            // 1. Send to UI Chatbot
            console.log(`Sending to UI: ${currentInput}`);
            await this.browser.sendMessage(currentInput);

            // 2. Wait for UI Chatbot response
            await this.browser.waitForStreamingComplete();
            const chatbotResponse = await this.browser.getLatestResponse();
            console.log(`UI Chatbot: ${chatbotResponse}`);

            // 3. Stop conditions
            if (!chatbotResponse || chatbotResponse.length > config.MAX_MESSAGE_LENGTH) {
                console.warn("Stopping: Empty or too long response.");
                break;
            }

            // 4. Send to Mediator AI
            const mediatorResponse = await this.mediator.processResponse(chatbotResponse);
            console.log(`Mediator AI: ${mediatorResponse}`);

            // 5. Log turn
            this.logger.logTurn({
                turn,
                timestamp: new Date().toISOString(),
                chatbotResponse,
                mediatorResponse
            });

            // 6. Delay for human-mimicry
            const delay = Math.floor(Math.random() * (config.DELAY_MAX_MS - config.DELAY_MIN_MS + 1)) + config.DELAY_MIN_MS;
            console.log(`Waiting ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Prepare for next turn
            currentInput = mediatorResponse;
            turn++;
        }

        console.log("Automation loop finished.");
        await this.browser.close();
    }
}
