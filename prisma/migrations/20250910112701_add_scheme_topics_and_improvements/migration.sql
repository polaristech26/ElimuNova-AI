-- AlterTable
ALTER TABLE "public"."schemes_of_work" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "schoolId" TEXT;

-- CreateTable
CREATE TABLE "public"."scheme_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weekNumber" INTEGER NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "objectives" TEXT[],
    "activities" TEXT[],
    "resources" TEXT[],
    "assessment" TEXT,
    "duration" INTEGER NOT NULL,
    "schemeOfWorkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheme_topics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."schemes_of_work" ADD CONSTRAINT "schemes_of_work_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheme_topics" ADD CONSTRAINT "scheme_topics_schemeOfWorkId_fkey" FOREIGN KEY ("schemeOfWorkId") REFERENCES "public"."schemes_of_work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
