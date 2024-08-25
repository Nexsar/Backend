import express from "express";
import { PrismaClient } from "@prisma/client";
import { IDistributor, IOption, IUploadParams } from "../types/types";
import { Agent } from "../agent";

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
    agent.start();
    console.log("agent started...");
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
            content: post_content,
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

export default router;
