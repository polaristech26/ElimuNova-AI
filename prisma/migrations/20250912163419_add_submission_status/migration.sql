-- AlterTable
ALTER TABLE "public"."submissions" ADD COLUMN     "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'PENDING';
