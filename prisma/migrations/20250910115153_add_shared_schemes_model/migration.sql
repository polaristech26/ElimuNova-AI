-- CreateTable
CREATE TABLE "public"."shared_schemes_of_work" (
    "id" TEXT NOT NULL,
    "schemeOfWorkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_schemes_of_work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_schemes_of_work_schemeOfWorkId_studentId_key" ON "public"."shared_schemes_of_work"("schemeOfWorkId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."shared_schemes_of_work" ADD CONSTRAINT "shared_schemes_of_work_schemeOfWorkId_fkey" FOREIGN KEY ("schemeOfWorkId") REFERENCES "public"."schemes_of_work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_schemes_of_work" ADD CONSTRAINT "shared_schemes_of_work_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_schemes_of_work" ADD CONSTRAINT "shared_schemes_of_work_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shared_schemes_of_work" ADD CONSTRAINT "shared_schemes_of_work_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
