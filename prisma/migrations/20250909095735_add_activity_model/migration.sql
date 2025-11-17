-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('TEACHER_ENROLLED', 'STUDENT_ENROLLED', 'CLASS_CREATED', 'PAYMENT_RECEIVED', 'MEETING_SCHEDULED', 'USER_LOGIN', 'USER_LOGOUT', 'SETTINGS_UPDATED', 'REPORT_GENERATED', 'PACKAGE_UPDATED', 'OTHER');

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "public"."ActivityType" NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
