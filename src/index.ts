import { Orchestrator } from './orchestrator';

async function main() {
    const orchestrator = new Orchestrator();
    try {
        await orchestrator.start();
    } catch (error) {
        console.error("Orchestrator failed:", error);
    }
}

main();
