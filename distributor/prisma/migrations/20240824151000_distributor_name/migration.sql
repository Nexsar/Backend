/*
  Warnings:

  - Added the required column `name` to the `Distributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "name" TEXT NOT NULL;
