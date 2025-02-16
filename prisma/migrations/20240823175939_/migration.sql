/*
  Warnings:

  - A unique constraint covering the columns `[userId,teamId,channelId]` on the table `LastReadTime` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamId` to the `LastReadTime` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LastReadTime_userId_channelId_key";

-- AlterTable
ALTER TABLE "LastReadTime" ADD COLUMN     "teamId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LastReadTime_userId_teamId_channelId_key" ON "LastReadTime"("userId", "teamId", "channelId");
