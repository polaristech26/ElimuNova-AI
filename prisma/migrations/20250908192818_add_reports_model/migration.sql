-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('ANALYTICS', 'FINANCIAL', 'ACADEMIC', 'USER_ACTIVITY', 'SYSTEM_HEALTH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."ReportType" NOT NULL DEFAULT 'ANALYTICS',
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "filters" TEXT,
    "generatedBy" TEXT NOT NULL,
    "schoolId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
