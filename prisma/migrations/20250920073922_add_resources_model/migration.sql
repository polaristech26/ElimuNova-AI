-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('NOTE', 'SUMMARY', 'WORKSHEET', 'QUIZ', 'ASSIGNMENT', 'REFERENCE', 'GUIDE', 'FORMULA_SHEET', 'VOCABULARY', 'CONCEPT_MAP', 'TIMELINE', 'DIAGRAM', 'OTHER');

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."ResourceType" NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT true,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "lessonPlanId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
