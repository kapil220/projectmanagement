/*
  Warnings:

  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - Added the required column `projectName` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Project_name_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "name",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "employees" TEXT[],
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "projectName" VARCHAR(255) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3);
