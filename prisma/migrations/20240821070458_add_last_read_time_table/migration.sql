-- CreateTable
CREATE TABLE "LastReadTime" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "channelId" TEXT NOT NULL,
    "teamId" TEXT,
    "LastReadTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LastReadTime_pkey" PRIMARY KEY ("id")
);
