-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "purchaseTime" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
