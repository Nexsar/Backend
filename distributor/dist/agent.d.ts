export declare class Agent {
    personality: string;
    frequency: string;
    distributor_id: number;
    id: number | undefined;
    constructor(personality: string, frequency: string, distributor_id: number);
    private generatePoll;
    private mintAndFetchTokenData;
    private generatePollDallee;
    start(signer?: any): void;
}
