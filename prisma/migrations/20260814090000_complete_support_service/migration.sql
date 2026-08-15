-- AlterTable
ALTER TABLE "ServiceRequest" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "ServiceRequest"
ADD COLUMN "requestCode" TEXT,
ADD COLUMN "customerName" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "model" TEXT,
ADD COLUMN "serialNumber" TEXT,
ADD COLUMN "issue" TEXT,
ADD COLUMN "preferredDate" TIMESTAMP(3),
ADD COLUMN "preferredTime" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Replace the required-user relation so guest requests can be retained.
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_userId_fkey";
ALTER TABLE "ServiceRequest"
ADD CONSTRAINT "ServiceRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "WarrantyRegistration" (
    "id" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "retailer" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarrantyRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceRequest_requestCode_key" ON "ServiceRequest"("requestCode");
CREATE INDEX "ServiceRequest_userId_idx" ON "ServiceRequest"("userId");
CREATE INDEX "ServiceRequest_serviceId_idx" ON "ServiceRequest"("serviceId");
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");
CREATE INDEX "ServiceRequest_email_idx" ON "ServiceRequest"("email");
CREATE UNIQUE INDEX "WarrantyRegistration_registrationCode_key" ON "WarrantyRegistration"("registrationCode");
CREATE UNIQUE INDEX "WarrantyRegistration_serialNumber_key" ON "WarrantyRegistration"("serialNumber");
CREATE INDEX "WarrantyRegistration_userId_idx" ON "WarrantyRegistration"("userId");
CREATE INDEX "WarrantyRegistration_status_idx" ON "WarrantyRegistration"("status");
CREATE INDEX "WarrantyRegistration_email_idx" ON "WarrantyRegistration"("email");

ALTER TABLE "WarrantyRegistration"
ADD CONSTRAINT "WarrantyRegistration_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
