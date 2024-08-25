import { generateImage, generateText } from "../utils/ai";
import schedule from "node-schedule";

const ai_text_test = async () => {
  const resp = await generateText("a blue sky");
  console.log({ resp });
};

const ai_image_test = async (prompt: string) => {
  const resp = await generateImage(prompt);
  console.log("image of ", prompt);
};

const test_cron = () => {
  const images = ["dogs", "cats", "giraffe"];
  schedule.scheduleJob("*/10 * * * * *", async () => {
    try {
      for (let i = 0; i < 3; i++) {
        const image = await ai_image_test(`${images[i]} - Variation${i}`);
        console.log("image no. ", i);
      }

      // await this.sendPoll(poll);]

      console.log("image created");
    } catch (error) {
      console.error("Failed to generate or send poll:", error);
    }
  });
};

test_cron();
