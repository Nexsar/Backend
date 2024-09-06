/*
  Warnings:

  - You are about to drop the column `optionId` on the `Worker` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Worker" DROP CONSTRAINT "Worker_optionId_fkey";

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "voters" INTEGER[];

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "optionId";
