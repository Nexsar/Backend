import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();

const prisma = new PrismaClient();
router.get("/all_posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        options: true,
      },
    });
    return res.status(200).json({ posts });
  } catch (error: any) {
    console.log("could not get all posts..", error);
    return res.status(500).json({ error: error });
  }
});

router.get("/post/:id", async (req, res) => {
  const post_id = parseInt(req.params.id, 10);

  if (isNaN(post_id)) {
    return res.status(400).json({ error: "invalisd post id" });
  }
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: post_id,
      },
      include: {
        options: true,
      },
    });

    return res.status(200).json({ post });
  } catch (error: any) {
    console.log("could not fetch all post with id", error);
    return res.status(500).json({ error: error });
  }
});

router.get("/posts/distributor/:id", async (req, res) => {
  const distributor_id = parseInt(req.params.id);

  if (isNaN(distributor_id)) {
    return res.status(400).json({ error: "invalid distributor id" });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        distributor_id: distributor_id,
      },
      include: {
        options: true,
      },
    });

    return res.status(200).json({ posts });
  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
});
export default router;
