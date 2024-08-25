import { generateImage, generateText } from "../utils/ai";
import schedule from "node-schedule";
import { storeToIpfs } from "../utils/upload_fle";

const ai_text_test = async () => {
  const resp = await generateText("a blue sky");
  console.log({ resp });
};

const ai_image_test = async (prompt: string) => {
  const resp = await generateImage(prompt);
  console.log("image of ", prompt);
};

const test_cron = () => {
  const prompts = [
    "you are a youtuber of coding channel. generate thumbnail for a video",
  ];
  schedule.scheduleJob("*/10 * * * * *", async () => {
    try {
      for (let i = 0; i < 3; i++) {
        const image = await ai_image_test(`${prompts[0]} - Variation${i}`);
        console.log("image no. ", i);
      }

      // await this.sendPoll(poll);]

      console.log("image created");
    } catch (error) {
      console.error("Failed to generate or send poll:", error);
    }
  });
};

async function test_generateAndStoreImageUrl(prompt: string): Promise<string> {
  try {
    // Step 1: Generate the image
    const imageBuffer = await generateImage(prompt);

    // Step 2: Store the image to IPFS and get the URL
    const imageUrl = await storeToIpfs(imageBuffer);

    return imageUrl;
  } catch (error) {
    console.error("Error in generateAndStoreImageUrl:", error);
    throw error;
  }
}

test_generateAndStoreImageUrl("coding boy");
