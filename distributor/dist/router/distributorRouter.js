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
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/info", (req, res) => {
    res.status(200).json({
        message: "ok",
    });
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ req });
    const { address, description, budget, name, frequency } = req.body;
    try {
        const distributor = yield prisma.distributor.create({
            data: {
                address: address,
                budget: budget,
                name: name,
                description: description,
                frequency: frequency,
                posts: {
                    create: [],
                },
            },
        });
        console.log("distributor created..", distributor);
        return res.status(200).json({
            distributor,
        });
    }
    catch (err) {
        console.log("could not create distributor..", err);
        return res.status(500).json({
            err: err,
        });
    }
}));
router.post("/upload", (req, res) => {
    // basically an agent should call upload for a particular user
    // ideally we should recieve the agents id and then upload the post
    // with the corresponding distributor as the author of the post
    const { agent_id } = req.body;
});
exports.default = router;
