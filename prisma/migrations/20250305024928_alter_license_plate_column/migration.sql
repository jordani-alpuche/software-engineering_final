/*
  Warnings:

  - You are about to drop the column `address` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `house_number` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `access_point` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `security` table. All the data in the column will be lost.
  - You are about to drop the column `shift` on the `security` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `resident` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `security` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resident_address` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resident_email` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resident_first_name` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resident_house_number` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resident_last_name` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resident_phone_number` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resident_qr_code` to the `resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_access_point` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_address` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_email` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_first_name` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_last_name` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_phone_number` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_qr_code` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security_shift` to the `security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entry_type` to the `visitor_entry_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "security" DROP CONSTRAINT "accesspoint_id";

-- AlterTable
ALTER TABLE "resident" DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "first_name",
DROP COLUMN "house_number",
DROP COLUMN "last_name",
DROP COLUMN "phone_number",
DROP COLUMN "qr_code",
ADD COLUMN     "resident_address" VARCHAR(50) NOT NULL,
ADD COLUMN     "resident_email" VARCHAR(50) NOT NULL,
ADD COLUMN     "resident_first_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "resident_house_number" VARCHAR(50) NOT NULL,
ADD COLUMN     "resident_last_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "resident_phone_number" VARCHAR(50) NOT NULL,
ADD COLUMN     "resident_qr_code" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "security" DROP COLUMN "access_point",
DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "phone_number",
DROP COLUMN "qr_code",
DROP COLUMN "shift",
ADD COLUMN     "security_access_point" INTEGER NOT NULL,
ADD COLUMN     "security_address" VARCHAR(50) NOT NULL,
ADD COLUMN     "security_email" VARCHAR(50) NOT NULL,
ADD COLUMN     "security_first_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "security_last_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "security_phone_number" VARCHAR(50) NOT NULL,
ADD COLUMN     "security_qr_code" VARCHAR(50) NOT NULL,
ADD COLUMN     "security_shift" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "visitor_entry_logs" ADD COLUMN     "entry_type" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "resident_user_id_key" ON "resident"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "security_user_id_key" ON "security"("user_id");

-- AddForeignKey
ALTER TABLE "security" ADD CONSTRAINT "accesspoint_id" FOREIGN KEY ("security_access_point") REFERENCES "access_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
