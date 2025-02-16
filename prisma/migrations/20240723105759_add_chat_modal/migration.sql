-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "lastMessage" TEXT NOT NULL,
    "lastMessageDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chat_sender_id_idx" ON "Chat"("sender_id");

-- CreateIndex
CREATE INDEX "Chat_receiver_id_idx" ON "Chat"("receiver_id");

-- CreateIndex
CREATE INDEX "ChatHistory_sender_id_idx" ON "ChatHistory"("sender_id");

-- CreateIndex
CREATE INDEX "ChatHistory_receiver_id_idx" ON "ChatHistory"("receiver_id");

-- CreateIndex
CREATE INDEX "ChatHistory_chat_id_idx" ON "ChatHistory"("chat_id");

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
