export declare class Agent {
    personality: string;
    frequency: string;
    distributor_id: number;
    constructor(personality: string, frequency: string, distributor_id: number);
    private generatePoll;
    start(): void;
}
