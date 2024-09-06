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
exports.Agent = void 0;
const axios_1 = __importDefault(require("axios"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const client_1 = require("@prisma/client");
const ai_1 = require("./utils/ai");
const upload_fle_1 = require("./utils/upload_fle");
const constants_1 = require("./constants/constants");
const Dalle_json_1 = __importDefault(require("../dist/contracts/Dalle.json"));
const ethers_1 = require("ethers");
const prisma = new client_1.PrismaClient();
//TODO: move them to constants
const uploadEndpoint = "http://localhost:8000/distributor/upload";
const registerEndpoint = "http://localhost:8000/agent/register";
class Agent {
    constructor(personality, frequency, distributor_id) {
        this.mintAndFetchTokenData = (prompt, signer) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Move contract address and ABI to constants
                const contractAddress = "0x5a76D8a2BAD252fe57fb5281029a46C65d96aF52"; // TODO: Move to constants file
                const contractABI = Dalle_json_1.default.abi; // TODO: Move to constants file
                // Initialize contract
                const dalleNftContract = new ethers_1.ethers.Contract(contractAddress, contractABI, signer);
                // Call initializeMint with the prompt message
                const tx = yield dalleNftContract.initializeMint(prompt);
                console.log("Minting initiated, waiting for confirmation...");
                // Wait for the transaction to be mined
                const receipt = yield tx.wait();
                const mintEvent = receipt.events.find((event) => event.event === "MintInputCreated");
                if (!mintEvent) {
                    throw new Error("MintInputCreated event not found in transaction receipt.");
                }
                const tokenId = mintEvent.args.chatId.toNumber();
                console.log(`MintInputCreated event detected. TokenId: ${tokenId}`);
                return new Promise((resolve, reject) => {
                    // Listen for the MetadataUpdate event for the specified tokenId
                    dalleNftContract.once("MetadataUpdate", (_tokenId) => __awaiter(this, void 0, void 0, function* () {
                        if (_tokenId.toNumber() === tokenId) {
                            console.log(`MetadataUpdate event detected for tokenId: ${tokenId}`);
                            try {
                                // Fetch the tokenURI
                                const tokenUri = yield dalleNftContract.tokenURI(tokenId);
                                console.log(`Token URI: ${tokenUri}`);
                                // Resolve the tokenUri as the final result
                                resolve(tokenUri);
                            }
                            catch (fetchError) {
                                console.error("Error fetching token data:", fetchError);
                                reject(fetchError);
                            }
                        }
                    }));
                    console.log(`Listening for MetadataUpdate event for tokenId: ${tokenId}...`);
                });
            }
            catch (error) {
                console.error("An error occurred during minting or event handling:", error);
                throw error;
            }
        });
        this.personality = personality;
        this.frequency = frequency;
        this.distributor_id = distributor_id;
        const register_agent = () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                distributor_id: this.distributor_id,
            };
            try {
                const response = yield fetch(registerEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                const agent = yield prisma.agent.findFirst({
                    where: {
                        distributor_id: this.distributor_id,
                    },
                });
                this.id = agent ? agent.id : -1;
            }
            catch (err) {
                console.log("error while trying to register agent..", err);
            }
        });
        register_agent();
        this.start();
        console.log("agent started...");
    }
    generatePoll(personality, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const text_prompt = `${constants_1.TEXT_PROMPT_PREFIX}${personality}.${constants_1.TEXT_PROMPT_SUFFIX} - Variation${index}.`;
            const text = yield (0, ai_1.generateText)(text_prompt);
            let image_urls = [];
            for (let i = 0; i < 3; i++) {
                const image_prompt = `${constants_1.IMAGE_PROMPT_PREFIX}:$[text}. - Variation${i}`;
                const imageBuffer = yield (0, ai_1.generateImage)(image_prompt);
                const imageUrl = yield (0, upload_fle_1.storeToIpfs)(imageBuffer);
                //todo : generate from dallee...
                image_urls.push(imageUrl);
            }
            console.log("Post Content:", {
                text,
                image_urls,
            });
            return { text, image_urls };
        });
    }
    generatePollDallee(personality, index, signer) {
        return __awaiter(this, void 0, void 0, function* () {
            const text_prompt = `${constants_1.TEXT_PROMPT_PREFIX}${personality}.${constants_1.TEXT_PROMPT_SUFFIX} - Variation${index}.`;
            const text = yield (0, ai_1.generateText)(text_prompt);
            let image_urls = [];
            for (let i = 0; i < 3; i++) {
                const image_prompt = `${constants_1.IMAGE_PROMPT_PREFIX}:$[text}. - Variation${i}`;
                const imageBuffer = yield (0, ai_1.generateImage)(image_prompt);
                const imageUrl = yield (0, upload_fle_1.storeToIpfs)(imageBuffer);
                //todo : generate from dallee...
                const tokenUri = yield this.mintAndFetchTokenData(image_prompt, signer);
                image_urls.push(tokenUri);
            }
            console.log("Post Content:", {
                text,
                image_urls,
            });
            return { text, image_urls };
        });
    }
    // Method to schedule poll generation and sending
    start(signer = null) {
        let post_no = 0;
        node_schedule_1.default.scheduleJob(this.frequency, () => __awaiter(this, void 0, void 0, function* () {
            try {
                //use the dallee method when you are sure that galadriel
                //would do the job
                //const poll = await this.generatePollDallee(this.personality, post_no +, signer);
                const poll = yield this.generatePoll(this.personality, post_no++);
                // await this.sendPoll(poll);
                console.log("poll created", { poll });
                console.log("going to post this poll now...");
                const response = yield axios_1.default.post(uploadEndpoint, {
                    agent_id: this.id,
                    post_content: poll.text,
                    option_imgs: poll.image_urls,
                });
                console.log("Upload successful:", response.data);
                return response.data;
            }
            catch (error) {
                console.error("Error uploading post:", error);
            }
        }));
    }
}
exports.Agent = Agent;
