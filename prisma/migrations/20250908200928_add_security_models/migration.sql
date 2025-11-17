-- CreateEnum
CREATE TYPE "public"."SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY', 'DATA_BREACH_ATTEMPT', 'UNAUTHORIZED_ACCESS', 'SYSTEM_INTRUSION', 'MALWARE_DETECTED', 'POLICY_VIOLATION', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'API_ABUSE', 'BRUTE_FORCE_ATTEMPT', 'PHISHING_ATTEMPT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."SecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."SecurityPolicyType" AS ENUM ('AUTHENTICATION', 'AUTHORIZATION', 'PASSWORD', 'SESSION', 'API_RATE_LIMITING', 'IP_WHITELIST', 'IP_BLACKLIST', 'FILE_UPLOAD', 'DATA_ACCESS', 'AUDIT_LOGGING', 'CUSTOM');

-- CreateTable
CREATE TABLE "public"."security_logs" (
    "id" TEXT NOT NULL,
    "eventType" "public"."SecurityEventType" NOT NULL,
    "severity" "public"."SecuritySeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "schoolId" TEXT,
    "metadata" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "policyType" "public"."SecurityPolicyType" NOT NULL,
    "rules" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_policies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."security_logs" ADD CONSTRAINT "security_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."security_logs" ADD CONSTRAINT "security_logs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."security_logs" ADD CONSTRAINT "security_logs_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."security_policies" ADD CONSTRAINT "security_policies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."security_policies" ADD CONSTRAINT "security_policies_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
