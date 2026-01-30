
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
    CHATBOT_URL: z.string().url(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    CHAT_INPUT_SELECTOR: z.string().default('textarea'),
    CHAT_SEND_BUTTON_SELECTOR: z.string().default('button[type="submit"]'),
    CHAT_STOP_BUTTON_SELECTOR: z.string().optional(),
    MAX_TURNS: z.coerce.number().default(10),
    MAX_MESSAGE_LENGTH: z.coerce.number().default(1000),
    DELAY_MIN_MS: z.coerce.number().default(2000),
    DELAY_MAX_MS: z.coerce.number().default(5000),
    LOG_FILE_PATH: z.string().default('logs/conversation.json'),
});

export const config = configSchema.parse(process.env);
