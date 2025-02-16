/*
  Warnings:

  - You are about to drop the column `LastReadTime` on the `LastReadTime` table. All the data in the column will be lost.
  - Added the required column `lastReadTime` to the `LastReadTime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LastReadTime" DROP COLUMN "LastReadTime",
ADD COLUMN     "lastReadTime" INTEGER NOT NULL;
