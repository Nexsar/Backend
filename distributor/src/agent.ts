import axios from "axios";
import schedule from "node-schedule";
import { PrismaClient } from "@prisma/client";
import { generateImage, generateText } from "./utils/ai";
import { storeToIpfs } from "./utils/upload_fle";
import {
  IMAGE_PROMPT_PREFIX,
  TEXT_PROMPT_PREFIX,
  TEXT_PROMPT_SUFFIX,
} from "./constants/constants";

import dalleJson from "../dist/contracts/Dalle.json";
import { ethers } from "ethers";

const prisma = new PrismaClient();

//TODO: move them to constants
const uploadEndpoint = "http://localhost:8000/distributor/upload";
const registerEndpoint = "http://localhost:8000/agent/register";

export class Agent {
  personality: string;
  frequency: string;
  distributor_id: number;
  id: number | undefined;

  constructor(personality: string, frequency: string, distributor_id: number) {
    this.personality = personality;
    this.frequency = frequency;
    this.distributor_id = distributor_id;

    const register_agent = async () => {
      const data = {
        distributor_id: this.distributor_id,
      };
      try {
        const response = await fetch(registerEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const agent = await prisma.agent.findFirst({
          where: {
            distributor_id: this.distributor_id,
          },
        });
        this.id = agent ? agent.id : -1;
      } catch (err) {
        console.log("error while trying to register agent..", err);
      }
    };
    register_agent();
    this.start();
    console.log("agent started...");
  }

  private async generatePoll(personality: string, index: number) {
    const text_prompt = `${TEXT_PROMPT_PREFIX}${personality}.${TEXT_PROMPT_SUFFIX} - Variation${index}.`;
    const text = await generateText(text_prompt);
    let image_urls = [];
    for (let i = 0; i < 3; i++) {
      const image_prompt = `${IMAGE_PROMPT_PREFIX}:$[text}. - Variation${i}`;
      const imageBuffer = await generateImage(image_prompt);
      const imageUrl = await storeToIpfs(imageBuffer);
      //todo : generate from dallee...

      image_urls.push(imageUrl);
    }

    console.log("Post Content:", {
      text,
      image_urls,
    });

    return { text, image_urls };
  }

  private mintAndFetchTokenData = async (
    prompt: string,
    signer: any,
  ): Promise<string> => {
    try {
      // Move contract address and ABI to constants
      const contractAddress = "0x5a76D8a2BAD252fe57fb5281029a46C65d96aF52"; // TODO: Move to constants file
      const contractABI = dalleJson.abi; // TODO: Move to constants file

      // Initialize contract
      const dalleNftContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );

      // Call initializeMint with the prompt message
      const tx = await dalleNftContract.initializeMint(prompt);
      console.log("Minting initiated, waiting for confirmation...");

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      const mintEvent = receipt.events.find(
        (event: any) => event.event === "MintInputCreated",
      );

      if (!mintEvent) {
        throw new Error(
          "MintInputCreated event not found in transaction receipt.",
        );
      }

      const tokenId = mintEvent.args.chatId.toNumber();
      console.log(`MintInputCreated event detected. TokenId: ${tokenId}`);

      return new Promise((resolve, reject) => {
        // Listen for the MetadataUpdate event for the specified tokenId
        dalleNftContract.once(
          "MetadataUpdate",
          async (_tokenId: ethers.BigNumber) => {
            if (_tokenId.toNumber() === tokenId) {
              console.log(
                `MetadataUpdate event detected for tokenId: ${tokenId}`,
              );

              try {
                // Fetch the tokenURI
                const tokenUri = await dalleNftContract.tokenURI(tokenId);
                console.log(`Token URI: ${tokenUri}`);

                // Resolve the tokenUri as the final result
                resolve(tokenUri);
              } catch (fetchError) {
                console.error("Error fetching token data:", fetchError);
                reject(fetchError);
              }
            }
          },
        );

        console.log(
          `Listening for MetadataUpdate event for tokenId: ${tokenId}...`,
        );
      });
    } catch (error) {
      console.error(
        "An error occurred during minting or event handling:",
        error,
      );
      throw error;
    }
  };

  private async generatePollDallee(
    personality: string,
    index: number,
    signer: any,
  ) {
    const text_prompt = `${TEXT_PROMPT_PREFIX}${personality}.${TEXT_PROMPT_SUFFIX} - Variation${index}.`;
    const text = await generateText(text_prompt);
    let image_urls = [];

    for (let i = 0; i < 3; i++) {
      const image_prompt = `${IMAGE_PROMPT_PREFIX}:$[text}. - Variation${i}`;
      const imageBuffer = await generateImage(image_prompt);
      const imageUrl = await storeToIpfs(imageBuffer);
      //todo : generate from dallee...
      const tokenUri = await this.mintAndFetchTokenData(image_prompt, signer);

      image_urls.push(tokenUri);
    }
    console.log("Post Content:", {
      text,
      image_urls,
    });

    return { text, image_urls };
  }

  // Method to schedule poll generation and sending
  public start(signer: any = null) {
    let post_no = 0;
    schedule.scheduleJob(this.frequency, async () => {
      try {
        //use the dallee method when you are sure that galadriel
        //would do the job

        //const poll = await this.generatePollDallee(this.personality, post_no +, signer);
        const poll = await this.generatePoll(this.personality, post_no++);
        // await this.sendPoll(poll);
        console.log("poll created", { poll });

        console.log("going to post this poll now...");
        const response = await axios.post(uploadEndpoint, {
          agent_id: this.id,
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
