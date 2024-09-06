import express from "express";
import { PrismaClient } from "@prisma/client";
import { IDistributor, IOption, IUploadParams } from "../types/types";
import { Agent } from "../agent";
import { TEXT_PROMPT_PREFIX, TEXT_PROMPT_SUFFIX } from "../constants/constants";

const router = express.Router();

const prisma = new PrismaClient();

router.get("/info", (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

router.post("/register", async (req, res) => {
  console.log({ req });
  const { address, description, budget, name, frequency } = req.body;

  try {
    const distributor = await prisma.distributor.create({
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

    const agent = new Agent(
      description,
      `*/${frequency} * * * * *`,
      distributor.id,
    );
    console.log("created agent");

    return res.status(200).json({
      distributor,
    });
  } catch (err: any) {
    console.log("could not create distributor..", err);
    return res.status(500).json({
      err: err,
    });
  }
});

//Note: I am assuming that signer will be passed from frontend and below api is
//what will be called
router.post("/signup", async (req, res) => {
  const { address, description, budget, name, frequency, signer } =
    req.body.data;

  try {
    const distributor = await prisma.distributor.create({
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
    const agent = new Agent(
      description,
      `*/${frequency} * * * * *`,
      distributor.id,
    );
    console.log("created agent");
    agent.start(signer);
    console.log("agent started...");
    return res.status(200).json({
      distributor,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ err: `could not create distributor due to error: ${err}` });
  }
});

router.post("/upload", async (req, res) => {
  // basically an agent should call upload for a particular distributor
  // ideally we should recieve the agents id and then upload the post
  // with the corresponding distributor as the author of the post

  const { agent_id, post_content, option_imgs }: IUploadParams = req.body;

  const agent = await prisma.agent.findUnique({
    where: {
      id: agent_id,
    },
  });

  if (agent) {
    //get the distributor corresponding to this agent
    const distributor_id = agent.distributor_id;
    const distributor = await prisma.distributor.findUnique({
      where: {
        id: distributor_id,
      },
    });
    if (distributor) {
      // IMP: we need to
      // 1) create a post 2) create the options 3) add the options to the post
      // all this should happen atomically, hence we should do a database transaction

      const post_with_options = await prisma.$transaction(async (tx) => {
        const post = await tx.post.create({
          data: {
            distributor_id: distributor_id,
            content: post_content ?? "select best pic",
            done: false,
          },
        });

        const options: IOption[] = [];
        for (const img_url of option_imgs) {
          const option = await tx.option.create({
            data: {
              post_id: post.id,
              image_url: img_url,
              votes: 0,
            },
          });

          options.push(option as IOption);
        }

        return post;
      });

      return res.status(200).json({ post_with_options });
    } else {
      return res.status(400).json({
        error: "agent does not have a distributor corresponding to it...",
      });
    }
  } else {
    return res
      .status(400)
      .json({ error: "you are not an agent... hehe badmosi!" });
  }
});

router.patch("/post_done/:id", async (req, res) => {
  //TODO: CHECK if the distributor is finishing his OWN posts only
  const { id } = req.params;

  try {
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await prisma.post.findFirst({
      where: { id: postId },
      include: {
        options: true,
      },
    });

    console.log({ post });

    const pay_worker_endpoint = "http://localhost:7000/worker/pay";
    let max_votes = -1;
    let winning_option_index = -1;
    if (!post) return;

    //we shoud mark the post done

    const post_done = await prisma.post.update({
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
    console.log(post.options[winning_option_index].voters);
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
      const response = await fetch(pay_worker_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log({ response });
    }

    return res.status(200).json({ message: "sent money to all" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the post" + error });
  }
});

export default router;
