import { generateImage, generateText } from "../utils/ai";

const ai_text_test = async () => {
  const resp = await generateText("a blue sky");
  console.log({ resp });
};

const ai_image_test = async () => {
  const resp = await generateImage("cat");
  console.log(resp);
};

ai_image_test();
