import cors from "cors";
import { ethers } from "ethers";
import express, { urlencoded } from "express";
import * as dotenv from 'dotenv';
dotenv.config();

import distributorRouter from "./router/distributorRouter";
import agentRouter from "./router/agentRouter";
import dataRouter from "./router/dataRouter";
import workerRouter from "./router/workerRoutes";

import dalleJson from "../dist/contracts/Dalle.json";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/distributor", distributorRouter);
app.use("/agent", agentRouter);
app.use("/data", dataRouter);
app.use("/worker", workerRouter);

app.get("/test", (req, res) => {
  console.log("test called");
  res.send({ "message": "ok" });
});

const contractAddress = "0x5a76D8a2BAD252fe57fb5281029a46C65d96aF52";
const contractABI = dalleJson.abi;

app.post("/getTokenUri", async (req, res) => {
  const signerAddress = req.body.signerAddress;
  const tokenId = req.body.tokenId;
  console.log("signer (address)", signerAddress);
  console.log("tokenId:", tokenId);

  try {
    const provider = new ethers.providers.JsonRpcProvider("https://devnet.galadriel.com");
    const signer = provider.getSigner(signerAddress);

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tokenURI = await contract.tokenURI(tokenId);
    const owner = await contract.ownerOf(tokenId);
    console.log(`Token URI: ${tokenURI}`);
    console.log(`Owner: ${owner}`);
    res.json({ tokenURI, owner });
  } catch (error) {
    console.error("Error fetching contract data:", error);
    res.status(500).json({ message: "Error fetching contract data" });
  }
});


app.post("/initializeMint", async (req, res) => {
  // const signerAddress = req.body.signerAddress;
  const prompt = req.body.prompt;
  try {
    const provider = new ethers.providers.JsonRpcProvider("https://devnet.galadriel.com");
    const wallet = new ethers.Wallet(process.env.GALADRIEL_ACCOUNT_PK as string, provider);

    const dalleNftContract = new ethers.Contract(contractAddress, contractABI, wallet);
    console.log("prompt: ", prompt);

    const tx = await dalleNftContract.initializeMint(prompt);
    console.log("Minting initiated, waiting for confirmation...");

    const receipt = await tx.wait();
    const mintEvent = receipt.events.find(
      (event: any) => event.event === "MintInputCreated",
    );
    const tokenId = mintEvent.args.chatId.toNumber();

    console.log(`MintInputCreated event detected. TokenId: ${tokenId}`);

    return new Promise<{ tokenId: any; tokenUri: any; owner: any }>(
      (resolve, reject) => {
        dalleNftContract.once("MetadataUpdate", async (_tokenId) => {
          if (_tokenId.toNumber() === tokenId) {
            console.log(
              `MetadataUpdate event detected for tokenId: ${tokenId}`,
            );

            try {
              const tokenUri = await dalleNftContract.tokenURI(tokenId);
              const owner = await dalleNftContract.ownerOf(tokenId);

              console.log(`Token Id: ${tokenId}`);
              console.log(`Token URI: ${tokenUri}`);
              console.log(`Token Owner: ${owner}`);

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

app.get("/test", (req, res) => {
  console.log("hello");
  res.send({ message: "ok" });
});

app.listen(8000, () => {
  console.log("Server up at port 8000");
});
