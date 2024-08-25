import axios from "axios";
import schedule from "node-schedule";
import { generateImage, generateText } from "./utils/ai";

//TODO: move them to constants
const uploadEndpoint = "http://localhost:8000/distributor/upload";

export class Agent {
  personality: string;
  frequency: string;
  distributor_id: number;

  constructor(personality: string, frequency: string, distributor_id: number) {
    this.personality = personality;
    this.frequency = frequency;
    this.distributor_id = distributor_id;
  }

  private async generatePoll(prompt: string) {
    const text = await generateText(prompt);
    const imageUrl = await generateImage(prompt);

    console.log("Post Content:", {
      text,
      imageUrl,
    });

    return { text, imageUrl };
  }

  // Method to schedule poll generation and sending
  public start() {
    schedule.scheduleJob(this.frequency, async () => {
      try {
        const poll = await this.generatePoll(this.personality);
        // await this.sendPoll(poll);
        console.log("poll created", { poll });
      } catch (error) {
        console.error("Failed to generate or send poll:", error);
      }
    });
  }
}
