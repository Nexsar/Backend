import FormData from "form-data";
import path from "path";
import axios from "axios";
import fs from "fs";
import { format_pinata_url } from "./format";

const pinataApiKey = "4c78e71e4d67b2acab15";
const pinataSecretApiKey =
  "d201ada4bdfe418a57befe857c90b6e3c91beea46919cdee77fa40dda0cf86c0";

export async function storeToIpfs(imageBuffer: any): Promise<string> {
  try {
    // Save the image temporarily to the server
    const imageName = `generated_image_${Date.now()}.png`;
    const imagePath = path.join(__dirname, imageName);
    fs.writeFileSync(imagePath, imageBuffer);

    // Upload the image to Pinata (IPFS)
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));

    const pinataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data;`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      },
    );

    // Get the IPFS hash from Pinata response
    const ipfsHash = pinataResponse.data.IpfsHash;
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // Clean up: delete the local image file
    fs.unlinkSync(imagePath);
    const formated_url = format_pinata_url(imageUrl);
    return formated_url;
  } catch (error) {
    console.error("Error storing image to IPFS:", error);
    throw error;
  }
}
