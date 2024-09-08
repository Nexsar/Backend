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
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/all_posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({
            include: {
                options: true,
            },
        });
        return res.status(200).json({ posts });
    }
    catch (error) {
        console.log("could not get all posts..", error);
        return res.status(500).json({ error: error });
    }
}));
router.get("/post/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post_id = parseInt(req.params.id, 10);
    if (isNaN(post_id)) {
        return res.status(400).json({ error: "invalisd post id" });
    }
    try {
        const post = yield prisma.post.findUnique({
            where: {
                id: post_id,
            },
            include: {
                options: true,
            },
        });
        return res.status(200).json({ post });
    }
    catch (error) {
        console.log("could not fetch all post with id", error);
        return res.status(500).json({ error: error });
    }
}));
router.get("/posts/distributor/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distributor_id = parseInt(req.params.id);
    if (isNaN(distributor_id)) {
        return res.status(400).json({ error: "invalid distributor id" });
    }
    try {
        const posts = yield prisma.post.findMany({
            where: {
                distributor_id: distributor_id,
            },
            include: {
                options: true,
            },
        });
        return res.status(200).json({ posts });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
router.get("/votes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield prisma.votes.findMany({});
        return res.status(200).json({ response });
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
}));
exports.default = router;
