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
exports.generateText = generateText;
exports.generateImage = generateImage;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const HUGGING_FACE_API_KEY = "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";
const model = "gpt2";
function generateText(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.post(`https://api-inference.huggingface.co/models/${model}`, { inputs: prompt }, {
                headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` },
            });
            const generatedText = (_a = response.data[0]) === null || _a === void 0 ? void 0 : _a.generated_text;
            console.log("Generated Text:", generatedText);
            return generatedText;
        }
        catch (error) {
            console.error("Error generating text:", error);
        }
    });
}
function generateImage(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4", { inputs: prompt }, {
                headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` },
                responseType: "arraybuffer",
            });
            const imageBuffer = Buffer.from(response.data, "binary");
            // Save the image as a PNG file
            const imagePath = "generated_image.png";
            fs_1.default.writeFileSync(imagePath, imageBuffer);
            console.log("saved image...");
        }
        catch (error) {
            console.error("Error generating image:", error);
        }
    });
}
