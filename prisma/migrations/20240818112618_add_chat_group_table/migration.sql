-- CreateTable
CREATE TABLE "ChatGroup" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "groupName" VARCHAR(255) NOT NULL,
    "teamId" TEXT,
    "status" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatGroup_pkey" PRIMARY KEY ("id")
);
