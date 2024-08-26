import express from "express";
import { PrismaClient } from "@prisma/client";

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

router.post("/vote/:option_id", async (req, res) => {
  //vote a particular option with particular option

  //TODO: we need to remove the vote for a different option for this particular post by this guy.

  const option_id = parseInt(req.params.option_id);

  if (isNaN(option_id)) {
    return res.status(400).json({ error: "invalid post or option" });
  }

  try {
    const response = await prisma.option.update({
      where: {
        id: option_id,
      },
      data: {
        votes: { increment: 1 },
      },
    });

    return res.status(200).json({ response });
  } catch (error: any) {
    return res.status(500).json({ error: error });
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
