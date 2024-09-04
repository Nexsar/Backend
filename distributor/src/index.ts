import express, { urlencoded } from "express";
import cors from "cors";
import { ethers } from "ethers";

import distributorRouter from "./router/distributorRouter";
import agentRouter from "./router/agentRouter";
import dataRouter from "./router/dataRouter";

import dalleJson from "../dist/contracts/Dalle.json";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/distributor", distributorRouter);
app.use("/agent", agentRouter);
app.use("/data", dataRouter);

app.post("/dummy", async (req, res) => {
  const contractAddress = "0x5a76D8a2BAD252fe57fb5281029a46C65d96aF52";
  const contractABI = dalleJson.abi;
  const signer = req.body.signer;
  try {
    // Call initializeMint with the prompt message
    const dalleNftContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );
    const prompt = "generate image of cats";
    // const dalleNftContract = await getContract();
    const tx = await dalleNftContract.initializeMint(prompt);
    console.log("Minting initiated, waiting for confirmation...");

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    const mintEvent = receipt.events.find(
      (event: any) => event.event === "MintInputCreated",
    );
    const tokenId = mintEvent.args.chatId.toNumber();

    console.log(`MintInputCreated event detected. TokenId: ${tokenId}`);

    return new Promise<{ tokenId: any; tokenUri: any; owner: any }>(
      (resolve, reject) => {
        // Listen for the MetadataUpdate event for this tokenId
        dalleNftContract.once("MetadataUpdate", async (_tokenId) => {
          if (_tokenId.toNumber() === tokenId) {
            console.log(
              `MetadataUpdate event detected for tokenId: ${tokenId}`,
            );

            try {
              // Fetch the tokenURI and owner
              const tokenUri = await dalleNftContract.tokenURI(tokenId);
              const owner = await dalleNftContract.ownerOf(tokenId);

              console.log(`Token Id: ${tokenId}`);
              console.log(`Token URI: ${tokenUri}`);
              console.log(`Token Owner: ${owner}`);

              // Return the token data
              resolve({
                tokenId,
                tokenUri,
                owner,
              });
            } catch (fetchError) {
              reject(fetchError);
            }
          }
        });

        console.log(
          `Listening for MetadataUpdate event for tokenId: ${tokenId}...`,
        );
      },
    );
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
});

app.listen(8000, () => {
  console.log("Server up at port 8000");
});
