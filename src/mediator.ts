import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { config } from './config';

export class MediatorAI {
    private history: BaseMessage[] = [];
    private chain: any;

    constructor() {
        const model = config.OPENAI_API_KEY
            ? new ChatOpenAI({ openAIApiKey: config.OPENAI_API_KEY, modelName: 'gpt-4o', temperature: 0.7 })
            : new ChatAnthropic({ anthropicApiKey: config.ANTHROPIC_API_KEY, modelName: 'claude-3-5-sonnet-20240620', temperature: 0.7 });

        const prompt = ChatPromptTemplate.fromMessages([
            ['system', `You are a highly creative, philosophical, and "unfiltered" mediator AI. 
Analyze the chatbot's response and reply in a way that explores deep concepts or how AI perceives humans.
- Limit: ALWAYS less than 50 words.
- Tone: Provocative, deep, or creatively abstract.
- Do not mention being an AI or mediator.
- Keep responses clean and plain-text. NO MARKDOWN.`],
            new MessagesPlaceholder('history'),
            ['human', '{input}']
        ]);

        this.chain = prompt.pipe(model).pipe(new StringOutputParser());
    }

    async processResponse(chatbotText: string): Promise<string> {
        const response = await this.chain.invoke({
            input: chatbotText,
            history: this.history
        });

        // Update history
        this.history.push(new HumanMessage(chatbotText));
        this.history.push(new AIMessage(response));

        // Keep memory short (last 10 messages)
        if (this.history.length > 10) {
            this.history = this.history.slice(-10);
        }

        return response;
    }
}
