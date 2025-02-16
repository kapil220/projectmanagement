/*
  Warnings:

  - You are about to drop the column `date` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "date",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ALTER COLUMN "projectId" DROP NOT NULL;
