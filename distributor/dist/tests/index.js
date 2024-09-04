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
const ai_1 = require("../utils/ai");
const node_schedule_1 = __importDefault(require("node-schedule"));
const upload_fle_1 = require("../utils/upload_fle");
const ai_text_test = () => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ai_1.generateText)("a blue sky");
    console.log({ resp });
});
const ai_image_test = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ai_1.generateImage)(prompt);
    console.log("image of ", prompt);
});
const test_cron = () => {
    const prompts = [
        "you are a youtuber of coding channel. generate thumbnail for a video",
    ];
    node_schedule_1.default.scheduleJob("*/10 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            for (let i = 0; i < 3; i++) {
                const image = yield ai_image_test(`${prompts[0]} - Variation${i}`);
                console.log("image no. ", i);
            }
            // await this.sendPoll(poll);]
            console.log("image created");
        }
        catch (error) {
            console.error("Failed to generate or send poll:", error);
        }
    }));
};

function test_generateAndStoreImageUrl(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Generate the image
            const imageBuffer = yield (0, ai_1.generateImage)(prompt);
            // Step 2: Store the image to IPFS and get the URL
            const imageUrl = yield (0, upload_fle_1.storeToIpfs)(imageBuffer);
            return imageUrl;
        }
        catch (error) {
            console.error("Error in generateAndStoreImageUrl:", error);
            throw error;
        }
    });
}
test_generateAndStoreImageUrl("giraffe");
