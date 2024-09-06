import express from "express";
import { Option, PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();

router.get("/info", (req, res) => {
  return res.status(200).json({ message: "ok" });
});

router.post("/register", async (req, res) => {
  const { address, name } = req.body;
  try {
    const worker = await prisma.worker.create({
      data: {
        address: address,
        name: name,
        amount: 0,
      },
    });

    return res.status(200).json({ worker });
  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
});

router.post("/vote/:post_id/:option_id", async (req, res) => {
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
    updated_post_votes = await prisma.$transaction(async (tx: any) => {
      const post = await tx.post.findFirst({
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

      const option = await tx.option.findFirst({
        where: {
          id: option_id,
        },
      });

      if (!option) {
        is_option_valid = false;
        return null;
      }

      await tx.option.update({
        where: { id: option_id },
        data: {
          voters: {
            push: worker_id,
          },
        },
      });

      //increase the votes of this option
      const response = await tx.option.update({
        where: {
          id: option_id,
        },
        data: {
          votes: { increment: 1 },
        },
      });

      //now we can safely return the response;
      return response;
    });
  } catch (err) {
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
    } else if (!is_option_valid) {
      return res
        .status(400)
        .json({ error: "option that you want to vote does not exist" });
    } else if (has_worker_already_voted_for_this_post) {
      return res
        .status(400)
        .json({ error: "you have already voted for this post" });
    } else {
      return res
        .status(500)
        .json({ error: "something very weird happened during voting" });
    }
  } else {
    // return res.status(200).send(updated_post_votes);
    return res.status(200).json({ message: "successfully added the vote" });
  }
});

router.post("/pay/:id/:amount", async (req, res) => {
  const worker_id = parseInt(req.params.id);
  const amount = parseInt(req.params.amount);

  try {
    const response = await prisma.worker.update({
      where: {
        id: worker_id,
      },
      data: {
        amount: { increment: amount },
      },
    });

    return res.status(200).json({ response });
  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
});

export default router;
