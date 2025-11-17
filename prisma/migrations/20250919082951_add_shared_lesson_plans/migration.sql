-- CreateTable
CREATE TABLE "public"."shared_lesson_plans" (
    "id" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_lesson_plans_lessonPlanId_studentId_key" ON "public"."shared_lesson_plans"("lessonPlanId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."shared_lesson_plans" ADD CONSTRAINT "shared_lesson_plans_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_lesson_plans" ADD CONSTRAINT "shared_lesson_plans_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_lesson_plans" ADD CONSTRAINT "shared_lesson_plans_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
