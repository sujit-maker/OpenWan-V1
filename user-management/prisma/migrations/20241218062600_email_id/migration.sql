/*
  Warnings:

  - Added the required column `emailId` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "emailId" TEXT NOT NULL;
