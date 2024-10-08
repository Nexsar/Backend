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
        const agent = new agent_1.Agent(description, `*/${frequency} * * * * *`, distributor.id);
        console.log("created agent");
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
//Note: I am assuming that signer will be passed from frontend and below api is
//what will be called
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, description, budget, name, frequency, signer } = req.body.data;
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
        const agent = new agent_1.Agent(description, `*/${frequency} * * * * *`, distributor.id);
        console.log("created agent");
        agent.start(signer);
        console.log("agent started...");
        return res.status(200).json({
            distributor,
        });
    }
    catch (err) {
        return res
            .status(500)
            .json({ err: `could not create distributor due to error: ${err}` });
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
                        content: post_content !== null && post_content !== void 0 ? post_content : "select best pic",
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
                return post;
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
router.patch("/post_done/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: CHECK if the distributor is finishing his OWN posts only
    const { id } = req.params;
    try {
        const postId = parseInt(id, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }
        const post = yield prisma.post.findFirst({
            where: { id: postId },
            include: {
                options: true,
            },
        });
        console.log({ post });
        const pay_worker_endpoint = "http://localhost:8000/worker/pay";
        let max_votes = -1;
        let winning_option_index = -1;
        if (!post)
            return;
        //we shoud mark the post done
        const post_done = yield prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                done: true,
            },
        });
        console.log({ post_done });
        //@ts-ignore
        for (let i = 0; i < post.options.length; i++) {
            //@ts-ignore
            let option = post.options[i];
            if (option.votes > max_votes) {
                max_votes = option.votes;
                winning_option_index = i;
            }
        }
        console.log(post.options[winning_option_index]);
        console.log(post.options[winning_option_index].votes);
        //@ts-ignore
        for (let i = 0; i < post.options[winning_option_index].voters.length; i++) {
            //TODO: remove 100 as hard-coded
            //@ts-ignore
            let worker_id = post.options[winning_option_index].voters[i];
            console.log({ worker_id });
            let data = {
                worker_id: worker_id,
                //@ts-ignore
                amount: 100 / post.options[winning_option_index].voters.length,
            };
            console.log({ data });
            const response = yield fetch(pay_worker_endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            console.log({ response });
        }
        return res.status(200).json({ message: "sent money to all" });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "An error occurred while updating the post" + error });
    }
}));
router.patch("/extract", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const distributor_id = req.body.distributor_id;
    const amount = 100;
    try {
        const response = yield prisma.distributor.update({
            where: {
                id: distributor_id,
            },
            data: {
                budget: { increment: -amount },
            },
        });
        return res.status(200).json({ response });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
exports.default = router;
