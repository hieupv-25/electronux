-- Corrective migration: keep the tables/data created previously while aligning
-- their fields with the actual warranty appointment and product registration flows.

ALTER TABLE "ServiceRequest" ALTER COLUMN "serviceId" DROP NOT NULL;
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_serviceId_fkey";
ALTER TABLE "ServiceRequest"
ADD CONSTRAINT "ServiceRequest_serviceId_fkey"
FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ServiceRequest"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "ward" TEXT,
ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "marketingCall" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "marketingSms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "marketingEmail" BOOLEAN NOT NULL DEFAULT false;

DROP INDEX IF EXISTS "WarrantyRegistration_serialNumber_key";
ALTER TABLE "WarrantyRegistration" ALTER COLUMN "serialNumber" DROP NOT NULL;
ALTER TABLE "WarrantyRegistration" ALTER COLUMN "city" DROP NOT NULL;

ALTER TABLE "WarrantyRegistration"
ADD COLUMN "productId" TEXT,
ADD COLUMN "pnc" TEXT,
ADD COLUMN "productName" TEXT,
ADD COLUMN "customerType" TEXT NOT NULL DEFAULT 'individual',
ADD COLUMN "salutation" TEXT,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "invoiceUrl" TEXT,
ADD COLUMN "marketingCall" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "marketingSms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "marketingEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "warrantyConsent" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "WarrantyRegistration_productId_idx" ON "WarrantyRegistration"("productId");
ALTER TABLE "WarrantyRegistration"
ADD CONSTRAINT "WarrantyRegistration_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
