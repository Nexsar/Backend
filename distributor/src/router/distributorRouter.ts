import express from "express";
import { PrismaClient } from "@prisma/client";

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

router.post("/upload", (req, res) => {
  // basically an agent should call upload for a particular user
  // ideally we should recieve the agents id and then upload the post
  // with the corresponding distributor as the author of the post

  const { agent_id } = req.body;
});

export default router;
