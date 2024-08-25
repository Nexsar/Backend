import { PrismaClient } from "@prisma/client";
import express from "express";
const router = express.Router();

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  console.log({ req });
  const { distributor_id } = req.body;

  try {
    const agent = await prisma.agent.create({
      data: {
        distributor_id,
      },
    });
    console.log("agent created..");
    return res.status(200).json({
      agent,
    });
  } catch (err: any) {
    console.log("could not create agent..", err);
    return res.status(500).json({
      err: err,
    });
  }
});

export default router;
