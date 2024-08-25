/*
  Warnings:

  - Added the required column `done` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "done" BOOLEAN NOT NULL;
