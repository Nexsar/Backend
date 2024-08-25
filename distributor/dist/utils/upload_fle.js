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
exports.storeToIpfs = storeToIpfs;
const form_data_1 = __importDefault(require("form-data"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const format_1 = require("./format");
const pinataApiKey = "4c78e71e4d67b2acab15";
const pinataSecretApiKey = "d201ada4bdfe418a57befe857c90b6e3c91beea46919cdee77fa40dda0cf86c0";
function storeToIpfs(imageBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Save the image temporarily to the server
            const imageName = `generated_image_${Date.now()}.png`;
            const imagePath = path_1.default.join(__dirname, imageName);
            fs_1.default.writeFileSync(imagePath, imageBuffer);
            // Upload the image to Pinata (IPFS)
            const formData = new form_data_1.default();
            formData.append("file", fs_1.default.createReadStream(imagePath));
            const pinataResponse = yield axios_1.default.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    "Content-Type": `multipart/form-data;`,
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                },
            });
            // Get the IPFS hash from Pinata response
            const ipfsHash = pinataResponse.data.IpfsHash;
            const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            // Clean up: delete the local image file
            fs_1.default.unlinkSync(imagePath);
            const formated_url = (0, format_1.format_pinata_url)(imageUrl);
            return formated_url;
        }
        catch (error) {
            console.error("Error storing image to IPFS:", error);
            throw error;
        }
    });
}
