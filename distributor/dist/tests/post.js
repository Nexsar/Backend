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
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants/constants");
const ai_1 = require("../utils/ai");
const upload_fle_1 = require("../utils/upload_fle");
const test_post_creation = (personality_1, ...args_1) => __awaiter(void 0, [personality_1, ...args_1], void 0, function* (personality, index = 2) {
    const text_prompt = `${constants_1.TEXT_PROMPT_PREFIX}${personality}.${constants_1.TEXT_PROMPT_SUFFIX} - Variation${index}.`;
    const text = yield (0, ai_1.generateText)(text_prompt);
    let image_urls = [];
    for (let i = 0; i < 3; i++) {
        const image_prompt = `${constants_1.IMAGE_PROMPT_PREFIX}:${text}. - Variation${i}`;
        const imageBuffer = yield (0, ai_1.generateImage)(image_prompt);
        const imageUrl = yield (0, upload_fle_1.storeToIpfs)(imageBuffer);
        image_urls.push(imageUrl);
    }
    console.log("Post Content:", {
        text,
        image_urls,
    });
});
test_post_creation("Animal lover");
