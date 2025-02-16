/*
  Warnings:

  - You are about to drop the column `teamId` on the `LastReadTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,channelId]` on the table `LastReadTime` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `LastReadTime` required. This step will fail if there are existing NULL values in that column.
  - Made the column `LastReadTime` on table `LastReadTime` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LastReadTime" DROP COLUMN "teamId",
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "LastReadTime" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "LastReadTime_userId_channelId_key" ON "LastReadTime"("userId", "channelId");
