-- CreateEnum
CREATE TYPE "public"."MessageSenderType" AS ENUM ('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."MessageRecipientType" AS ENUM ('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."AIContentType" AS ENUM ('RUBRIC', 'POWERPOINT', 'ASSIGNMENT', 'PROJECT');

-- AlterTable
ALTER TABLE "public"."schemes_of_work" ALTER COLUMN "term" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "public"."MessageSenderType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" "public"."MessageRecipientType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "parentId" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_generated_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."AIContentType" NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "metadata" JSONB,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_generated_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shared_ai_content" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_ai_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shared_ai_content_with_class" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_ai_content_with_class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_senderId_senderType_idx" ON "public"."messages"("senderId", "senderType");

-- CreateIndex
CREATE INDEX "messages_recipientId_recipientType_idx" ON "public"."messages"("recipientId", "recipientType");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "shared_ai_content_contentId_studentId_key" ON "public"."shared_ai_content"("contentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_ai_content_with_class_contentId_classId_key" ON "public"."shared_ai_content_with_class"("contentId", "classId");

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_generated_content" ADD CONSTRAINT "ai_generated_content_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_ai_content" ADD CONSTRAINT "shared_ai_content_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."ai_generated_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_ai_content" ADD CONSTRAINT "shared_ai_content_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_ai_content_with_class" ADD CONSTRAINT "shared_ai_content_with_class_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."ai_generated_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_ai_content_with_class" ADD CONSTRAINT "shared_ai_content_with_class_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
