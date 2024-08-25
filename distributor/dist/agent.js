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
const ai_1 = require("./utils/ai");
const upload_fle_1 = require("./utils/upload_fle");
const constants_1 = require("./constants/constants");
//TODO: move them to constants
const uploadEndpoint = "http://localhost:8000/distributor/upload";
class Agent {
    constructor(personality, frequency, distributor_id) {
        this.personality = personality;
        this.frequency = frequency;
        this.distributor_id = distributor_id;
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
                image_urls.push(imageUrl);
            }
            console.log("Post Content:", {
                text,
                image_urls,
            });
            return { text, image_urls };
        });
    }
    // Method to schedule poll generation and sending
    start() {
        let post_no = 0;
        node_schedule_1.default.scheduleJob(this.frequency, () => __awaiter(this, void 0, void 0, function* () {
            try {
                const poll = yield this.generatePoll(this.personality, post_no++);
                // await this.sendPoll(poll);
                console.log("poll created", { poll });
                console.log("going to post this poll now...");
                const response = yield axios_1.default.post(uploadEndpoint, {
                    agent_id: 1, //TODO: register an agent first and then add its id here
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
