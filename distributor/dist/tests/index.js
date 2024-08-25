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
const ai_text_test = () => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ai_1.generateText)("a blue sky");
    console.log({ resp });
});
const ai_image_test = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ai_1.generateImage)(prompt);
    console.log("image of ", prompt);
});
const test_cron = () => {
    const images = ["dogs", "cats", "giraffe"];
    node_schedule_1.default.scheduleJob("*/10 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            for (let i = 0; i < 3; i++) {
                const image = yield ai_image_test(`${images[i]} - Variation${i}`);
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
test_cron();
