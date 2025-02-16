/*
  Warnings:

  - You are about to drop the column `details` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `employees` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "details",
DROP COLUMN "employees",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "teamId" TEXT;
