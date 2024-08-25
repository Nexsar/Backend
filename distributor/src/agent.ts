import axios from "axios";
import schedule from "node-schedule";
import { generateImage, generateText } from "./utils/ai";
import { storeToIpfs } from "./utils/upload_fle";
import {
  IMAGE_PROMPT_PREFIX,
  TEXT_PROMPT_PREFIX,
  TEXT_PROMPT_SUFFIX,
} from "./constants/constants";

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

  private async generatePoll(personality: string, index: number) {
    const text_prompt = `${TEXT_PROMPT_PREFIX}${personality}.${TEXT_PROMPT_SUFFIX} - Variation${index}.`;
    const text = await generateText(text_prompt);
    let image_urls = [];
    for (let i = 0; i < 3; i++) {
      const image_prompt = `${IMAGE_PROMPT_PREFIX}:$[text}. - Variation${i}`;
      const imageBuffer = await generateImage(image_prompt);
      const imageUrl = await storeToIpfs(imageBuffer);

      image_urls.push(imageUrl);
    }

    console.log("Post Content:", {
      text,
      image_urls,
    });

    return { text, image_urls };
  }

  // Method to schedule poll generation and sending
  public start() {
    let post_no = 0;
    schedule.scheduleJob(this.frequency, async () => {
      try {
        const poll = await this.generatePoll(this.personality, post_no++);
        // await this.sendPoll(poll);
        console.log("poll created", { poll });

        console.log("going to post this poll now...");
        const response = await axios.post(uploadEndpoint, {
          agent_id: 1, //TODO: register an agent first and then add its id here
          post_content: poll.text,
          option_imgs: poll.image_urls,
        });

        console.log("Upload successful:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error uploading post:", error);
      }
    });
  }
}
