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
const ai_1 = require("../utils/ai");
const ai_text_test = () => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ai_1.generateText)("a blue sky");
    console.log({ resp });
});
const ai_image_test = () => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ai_1.generateImage)("cat");
    console.log(resp);
});
ai_image_test();
