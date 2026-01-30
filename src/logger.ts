import fs from 'fs';
import path from 'path';
import { config } from './config';

export interface LogEntry {
    turn: number;
    timestamp: string;
    chatbotResponse: string;
    mediatorResponse: string;
}

export class Logger {
    private logPath: string;

    constructor() {
        this.logPath = path.resolve(config.LOG_FILE_PATH);
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.logPath)) {
            fs.writeFileSync(this.logPath, JSON.stringify([], null, 2));
        }
    }

    logTurn(entry: LogEntry) {
        const logs = JSON.parse(fs.readFileSync(this.logPath, 'utf-8'));
        logs.push(entry);
        fs.writeFileSync(this.logPath, JSON.stringify(logs, null, 2));
        console.log(`[Turn ${entry.turn}] Logged.`);
    }
}
