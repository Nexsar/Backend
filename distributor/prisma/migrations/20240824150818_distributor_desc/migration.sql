/*
  Warnings:

  - Added the required column `description` to the `Distributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "description" TEXT NOT NULL;
