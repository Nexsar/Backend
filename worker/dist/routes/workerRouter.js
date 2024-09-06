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
    return res.status(200).json({ message: "ok" });
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, name } = req.body;
    try {
        const worker = yield prisma.worker.create({
            data: {
                address: address,
                name: name,
                amount: 0,
            },
        });
        return res.status(200).json({ worker });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
router.post("/vote/:option_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //vote a particular option with particular option
    //TODO: we need to remove the vote for a different option for this particular post by this guy.
    const option_id = parseInt(req.params.option_id);
    if (isNaN(option_id)) {
        return res.status(400).json({ error: "invalid post or option" });
    }
    try {
        const response = yield prisma.option.update({
            where: {
                id: option_id,
            },
            data: {
                votes: { increment: 1 },
            },
        });
        return res.status(200).json({ response });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
router.post("/pay/:id/:amount", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const worker_id = parseInt(req.params.id);
    const amount = parseInt(req.params.amount);
    try {
        const response = yield prisma.worker.update({
            where: {
                id: worker_id,
            },
            data: {
                amount: { increment: amount },
            },
        });
        return res.status(200).json({ response });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
exports.default = router;
