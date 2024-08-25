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
const node_schedule_1 = __importDefault(require("node-schedule"));
const ai_1 = require("./utils/ai");
//TODO: move them to constants
const uploadEndpoint = "http://localhost:8000/distributor/upload";
class Agent {
    constructor(personality, frequency, distributor_id) {
        this.personality = personality;
        this.frequency = frequency;
        this.distributor_id = distributor_id;
    }
    generatePoll(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield (0, ai_1.generateText)(prompt);
            const imageUrl = yield (0, ai_1.generateImage)(prompt);
            console.log("Post Content:", {
                text,
                imageUrl,
            });
            return { text, imageUrl };
        });
    }
    // Method to schedule poll generation and sending
    start() {
        node_schedule_1.default.scheduleJob(this.frequency, () => __awaiter(this, void 0, void 0, function* () {
            try {
                const poll = yield this.generatePoll(this.personality);
                // await this.sendPoll(poll);
                console.log("poll created", { poll });
            }
            catch (error) {
                console.error("Failed to generate or send poll:", error);
            }
        }));
    }
}
exports.Agent = Agent;
