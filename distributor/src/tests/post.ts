import {
  IMAGE_PROMPT_PREFIX,
  TEXT_PROMPT_PREFIX,
  TEXT_PROMPT_SUFFIX,
} from "../constants/constants";
import { generateImage, generateText } from "../utils/ai";
import { storeToIpfs } from "../utils/upload_fle";

const test_post_creation = async (personality: string, index = 2) => {
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
};

test_post_creation("Animal lover");
