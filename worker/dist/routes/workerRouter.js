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
router.post("/vote/:post_id/:option_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const worker_id = req.body.worker_id;
    //vote a particular option with particular option
    //TODO: we need to remove the vote for a different option for this particular post by this guy.
    const post_id = parseInt(req.params.post_id);
    const option_id = parseInt(req.params.option_id);
    if (isNaN(option_id) || isNaN(post_id)) {
        return res.status(400).json({ error: "invalid post or option" });
    }
    let is_post_valid = true;
    let is_option_valid = true;
    let has_worker_already_voted_for_this_post = false;
    let updated_post_votes = null;
    try {
        updated_post_votes = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const post = yield tx.post.findFirst({
                where: {
                    id: post_id,
                },
                include: {
                    options: true,
                },
            });
            //now we need to go thru all options
            if (!post) {
                is_post_valid = false;
                return null;
            }
            // return post;
            console.log("post", post);
            const options = post.options;
            for (const option of options) {
                const voters = option.voters;
                //now we need to see if this worker is there in any voters list
                for (const voter of voters) {
                    if (voter === worker_id) {
                        has_worker_already_voted_for_this_post = true;
                        return null;
                    }
                }
            }
            //now we can add this guy to the list of voters for
            //this option
            const option = yield tx.option.findFirst({
                where: {
                    id: option_id,
                },
            });
            if (!option) {
                is_option_valid = false;
                return null;
            }
            yield tx.option.update({
                where: { id: option_id },
                data: {
                    voters: {
                        push: worker_id,
                    },
                },
            });
            //increase the votes of this option
            const response = yield tx.option.update({
                where: {
                    id: option_id,
                },
                data: {
                    votes: { increment: 1 },
                },
            });
            //now we can safely return the response;
            return response;
        }));
    }
    catch (err) {
        return res
            .status(500)
            .json({ error: "something went wrong while voting" + err });
    }
    console.log("post_updated", updated_post_votes);
    if (!updated_post_votes) {
        if (!is_post_valid) {
            return res
                .status(400)
                .json({ error: "post that you want to vote does not exist" });
        }
        else if (!is_option_valid) {
            return res
                .status(400)
                .json({ error: "option that you want to vote does not exist" });
        }
        else if (has_worker_already_voted_for_this_post) {
            return res
                .status(400)
                .json({ error: "you have already voted for this post" });
        }
        else {
            return res
                .status(500)
                .json({ error: "something very weird happened during voting" });
        }
    }
    else {
        // return res.status(200).send(updated_post_votes);
        return res.status(200).json({ message: "successfully added the vote" });
    }
}));
router.post("/pay", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const worker_id = req.body.worker_id;
    const amount = req.body.amount;
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
router.post("/redeem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const worker_id = req.body.worker_id;
    try {
        const response = yield prisma.worker.update({
            where: {
                id: worker_id,
            },
            data: {
                amount: 0,
            },
        });
        return res.status(200).json({ response });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
exports.default = router;
