/*
  Warnings:

  - The `lastReadTime` column on the `LastReadTime` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LastReadTime" DROP COLUMN "lastReadTime",
ADD COLUMN     "lastReadTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
