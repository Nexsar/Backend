import axios from "axios";
import fs from "fs";

const HUGGING_FACE_API_KEY = "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";
const model = "gpt2";

export async function generateText(prompt: string) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` },
      },
    );

    const generatedText = response.data[0]?.generated_text;
    console.log("Generated Text:", generatedText);
    return generatedText;
  } catch (error) {
    console.error("Error generating text:", error);
  }
}

export async function generateImage(prompt: string) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` },
        responseType: "arraybuffer",
      },
    );
    const imageBuffer = Buffer.from(response.data, "binary");

    // Save the image as a PNG file
    const imagePath = "generated_image.png";
    fs.writeFileSync(imagePath, imageBuffer);
    console.log("saved image...");
  } catch (error) {
    console.error("Error generating image:", error);
  }
}
