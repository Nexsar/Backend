-- CreateTable
CREATE TABLE "Votes" (
    "id" SERIAL NOT NULL,
    "worker_address" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);
