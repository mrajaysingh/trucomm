/*
  Warnings:

  - You are about to drop the column `purchaseDate` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseTime` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `companyAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "purchaseDate",
DROP COLUMN "purchaseTime",
DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "companyAddress",
DROP COLUMN "companyId",
DROP COLUMN "companyName",
DROP COLUMN "firstName",
DROP COLUMN "lastName";
