# AI-to-AI Automation Loop (Gemini Edition)

An experimental research application that orchestrates a conversation between a UI-based chatbot (Gemini) and an external LLM using Playwright and LangChain.

## Overview

This system creates an automation loop where:
1.  **UI Chatbot (Gemini)** generates a response.
2.  **Mediator AI (LangChain)** analyzes and transforms that response based on a philosophical prompt.
3.  The transformed response is pasted back into **Gemini** to continue the cycle.

## Prerequisites

-   **Node.js** (v20 or higher)
-   **npm**
-   An **OpenAI** or **Anthropic** API key (for the Mediator layer)
-   A Google account (to use Gemini)

## Installation

1.  **Clone or navigate** to the project directory:
    ```bash
    cd AI_to_AI
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Install Playwright Browsers**:
    ```bash
    npx playwright install chromium
    ```

## Configuration

1.  **Create a `.env` file** in the root directory. You can copy the template from [.env.example](.env.example):
    ```bash
    cp .env.example .env
    ```

2.  **Edit the `.env` file** and provide your API Key:
    ```env
    # Choose your preferred provider
    OPENAI_API_KEY=sk-....
    # OR
    ANTHROPIC_API_KEY=sk-ant-...
    ```

3.  **Confirm Gemini Selectors** (Pre-configured for the current Gemini UI):
    ```env
    CHATBOT_URL=https://gemini.google.com/app
    CHAT_INPUT_SELECTOR=div[contenteditable="true"][role="textbox"]
    CHAT_SEND_BUTTON_SELECTOR=button[aria-label*="Send message"]
    CHAT_STOP_BUTTON_SELECTOR=button[aria-label="Stop response"]
    ```

## How to Run

1.  **Start the Orchestrator**:
    ```bash
    npx ts-node src/index.ts
    ```

2.  **Handle Authentication**:
    A non-headless Chromium window will open. If you are not logged into Google, **manually log in now**. The script will wait for the page to load the chat interace.

3.  **Observe**:
    The system will automatically:
    - Type the initial message.
    - Wait for Gemini to finish streaming.
    - Extract the response.
    - Pass it through the Mediator AI.
    - Paste the new prompt back into Gemini.

## Observability

-   **Logs**: Every turn is logged as structured JSON in `logs/conversation.json`.
-   **Terminal**: Real-time progress and AI responses are printed to the console.

## Safety & Limits

-   **MAX_TURNS**: Set in `.env` (default 20) to prevent infinite loops.
-   **Human Mimicry**: Randomized typing delays and inter-turn pauses are implemented in `src/browser.ts` and `src/orchestrator.ts`.
-   **Trusted Types**: The system uses `textContent` instead of `innerHTML` to remain compliant with Gemini's security policies.

---

**Note**: This is an experimental research tool. The selectors may need adjustment if Google updates the Gemini UI.
