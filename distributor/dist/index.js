"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ethers_1 = require("ethers");
const distributorRouter_1 = __importDefault(require("./router/distributorRouter"));
const agentRouter_1 = __importDefault(require("./router/agentRouter"));
const dataRouter_1 = __importDefault(require("./router/dataRouter"));
const Dalle_json_1 = __importDefault(require("../dist/contracts/Dalle.json"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/distributor", distributorRouter_1.default);
app.use("/agent", agentRouter_1.default);
app.use("/data", dataRouter_1.default);
app.get("/test", (req, res) => {
    console.log("test called");
    res.send({ "message": "ok" });
});
const contractAddress = "0x5a76D8a2BAD252fe57fb5281029a46C65d96aF52";
const contractABI = Dalle_json_1.default.abi;
app.post("/getTokenUri", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signerAddress = req.body.signerAddress;
    const tokenId = req.body.tokenId;
    console.log("signer (address)", signerAddress);
    console.log("tokenId:", tokenId);
    try {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://devnet.galadriel.com");
        const signer = provider.getSigner(signerAddress);
        const contract = new ethers_1.ethers.Contract(contractAddress, contractABI, signer);
        const tokenURI = yield contract.tokenURI(tokenId);
        const owner = yield contract.ownerOf(tokenId);
        console.log(`Token URI: ${tokenURI}`);
        console.log(`Owner: ${owner}`);
        res.json({ tokenURI, owner });
    }
    catch (error) {
        console.error("Error fetching contract data:", error);
        res.status(500).json({ message: "Error fetching contract data" });
    }
}));
app.post("/initializeMint", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const signerAddress = req.body.signerAddress;
    const prompt = req.body.prompt;
    try {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://devnet.galadriel.com");
        const wallet = new ethers_1.ethers.Wallet("dd4689c15f6b4b81907709f1a550601e922d181d47cb07e11f41e5d33aa1e188", provider);
        const dalleNftContract = new ethers_1.ethers.Contract(contractAddress, contractABI, wallet);
        console.log("prompt: ", prompt);
        const tx = yield dalleNftContract.initializeMint(prompt);
        console.log("Minting initiated, waiting for confirmation...");
        const receipt = yield tx.wait();
        const mintEvent = receipt.events.find((event) => event.event === "MintInputCreated");
        const tokenId = mintEvent.args.chatId.toNumber();
        console.log(`MintInputCreated event detected. TokenId: ${tokenId}`);
        return new Promise((resolve, reject) => {
            dalleNftContract.once("MetadataUpdate", (_tokenId) => __awaiter(void 0, void 0, void 0, function* () {
                if (_tokenId.toNumber() === tokenId) {
                    console.log(`MetadataUpdate event detected for tokenId: ${tokenId}`);
                    try {
                        const tokenUri = yield dalleNftContract.tokenURI(tokenId);
                        const owner = yield dalleNftContract.ownerOf(tokenId);
                        console.log(`Token Id: ${tokenId}`);
                        console.log(`Token URI: ${tokenUri}`);
                        console.log(`Token Owner: ${owner}`);
                        resolve({
                            tokenId,
                            tokenUri,
                            owner,
                        });
                    }
                    catch (fetchError) {
                        reject(fetchError);
                    }
                }
            }));
            console.log(`Listening for MetadataUpdate event for tokenId: ${tokenId}...`);
        });
    }
    catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}));
app.listen(8000, () => {
    console.log("Server up at port 8000");
});
