-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "optionId" INTEGER,
ALTER COLUMN "amount" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "distributor_id" INTEGER NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
