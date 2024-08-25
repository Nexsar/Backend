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
const agent_1 = require("../agent");
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
        const agent = new agent_1.Agent("you are a youtuber who creates videos about political issues", "*/20 * * * * *", 1);
        console.log("created agent");
        agent.start();
        console.log("agent started...");
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
router.post("/upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // basically an agent should call upload for a particular distributor
    // ideally we should recieve the agents id and then upload the post
    // with the corresponding distributor as the author of the post
    const { agent_id, post_content, option_imgs } = req.body;
    const agent = yield prisma.agent.findUnique({
        where: {
            id: agent_id,
        },
    });
    if (agent) {
        //get the distributor corresponding to this agent
        const distributor_id = agent.distributor_id;
        const distributor = yield prisma.distributor.findUnique({
            where: {
                id: distributor_id,
            },
        });
        if (distributor) {
            // IMP: we need to
            // 1) create a post 2) create the options 3) add the options to the post
            // all this should happen atomically, hence we should do a database transaction
            const post_with_options = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                const post = yield tx.post.create({
                    data: {
                        distributor_id: distributor_id,
                        content: post_content,
                        done: false,
                    },
                });
                const options = [];
                for (const img_url of option_imgs) {
                    const option = yield tx.option.create({
                        data: {
                            post_id: post.id,
                            image_url: img_url,
                            votes: 0,
                        },
                    });
                    options.push(option);
                }
                const updated_post = yield tx.post.update({
                    where: {
                        id: post.id,
                    },
                    data: {
                        options: {
                            create: options,
                        },
                    },
                });
                return updated_post;
            }));
            return res.status(200).json({ post_with_options });
        }
        else {
            return res.status(400).json({
                error: "agent does not have a distributor corresponding to it...",
            });
        }
    }
    else {
        return res
            .status(400)
            .json({ error: "you are not an agent... hehe badmosi!" });
    }
}));
exports.default = router;
