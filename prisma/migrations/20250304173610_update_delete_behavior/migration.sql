/*
  Warnings:

  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code_id` on the `visitor_entry_logs` table. All the data in the column will be lost.
  - You are about to drop the column `visitor_id` on the `visitor_entry_logs` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_id` on the `visitor_feedback` table. All the data in the column will be lost.
  - You are about to drop the column `visitor_id` on the `visitor_feedback` table. All the data in the column will be lost.
  - You are about to drop the `_usersTovisitor_entry_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `banned_visitors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `qr_codes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resident_entry_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `residents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `security_guards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `visitor_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `visitors` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `user_id` on table `login_log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vehicle_make` on table `resident_vehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vehicle_model` on table `resident_vehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `license_plate` on table `resident_vehicle` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `visitor_schedule_id` to the `visitor_entry_logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `security_id` on table `visitor_entry_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `entry_time` on table `visitor_entry_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `access_point_id` on table `visitor_entry_logs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `visitor_schedule_id` to the `visitor_feedback` table without a default value. This is not possible if the table is not empty.
  - Made the column `rating` on table `visitor_feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_usersTovisitor_entry_logs" DROP CONSTRAINT "_usersTovisitor_entry_logs_A_fkey";

-- DropForeignKey
ALTER TABLE "_usersTovisitor_entry_logs" DROP CONSTRAINT "_usersTovisitor_entry_logs_B_fkey";

-- DropForeignKey
ALTER TABLE "banned_visitors" DROP CONSTRAINT "banned_visitors_user_id_fkey";

-- DropForeignKey
ALTER TABLE "banned_visitors" DROP CONSTRAINT "banned_visitors_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "login_log" DROP CONSTRAINT "login_log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "qr_codes" DROP CONSTRAINT "qr_codes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "resident_entry_log" DROP CONSTRAINT "resident_entry_log_resident_id_fkey";

-- DropForeignKey
ALTER TABLE "resident_entry_log" DROP CONSTRAINT "resident_entry_log_security_id_fkey";

-- DropForeignKey
ALTER TABLE "resident_vehicle" DROP CONSTRAINT "resident_vehicle_resident_id_fkey";

-- DropForeignKey
ALTER TABLE "residents" DROP CONSTRAINT "residents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "security_guards" DROP CONSTRAINT "security_guards_access_point_id_fkey";

-- DropForeignKey
ALTER TABLE "security_guards" DROP CONSTRAINT "security_guards_user_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitor_entry_logs_access_point_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitor_entry_logs_qr_code_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitor_entry_logs_security_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitor_entry_logs_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_feedback" DROP CONSTRAINT "visitor_feedback_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_feedback" DROP CONSTRAINT "visitor_feedback_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_schedule" DROP CONSTRAINT "visitor_schedule_resident_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_schedule" DROP CONSTRAINT "visitor_schedule_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "visitors" DROP CONSTRAINT "visitors_resident_id_fkey";

-- DropIndex
DROP INDEX "idx_entry_logs_visitor_id";

-- AlterTable
ALTER TABLE "login_log" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "ip_address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "user_id",
ADD COLUMN     "resident_id" INTEGER,
ADD COLUMN     "security_id" INTEGER,
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "resident_vehicle" ALTER COLUMN "vehicle_make" SET NOT NULL,
ALTER COLUMN "vehicle_model" SET NOT NULL,
ALTER COLUMN "license_plate" SET NOT NULL;

-- AlterTable
ALTER TABLE "visitor_entry_logs" DROP COLUMN "qr_code_id",
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_schedule_id" INTEGER NOT NULL,
ALTER COLUMN "security_id" SET NOT NULL,
ALTER COLUMN "entry_time" SET NOT NULL,
ALTER COLUMN "access_point_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "visitor_feedback" DROP COLUMN "schedule_id",
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_schedule_id" INTEGER NOT NULL,
ALTER COLUMN "rating" SET NOT NULL;

-- DropTable
DROP TABLE "_usersTovisitor_entry_logs";

-- DropTable
DROP TABLE "banned_visitors";

-- DropTable
DROP TABLE "qr_codes";

-- DropTable
DROP TABLE "resident_entry_log";

-- DropTable
DROP TABLE "residents";

-- DropTable
DROP TABLE "security_guards";

-- DropTable
DROP TABLE "visitor_schedule";

-- DropTable
DROP TABLE "visitors";

-- CreateTable
CREATE TABLE "blacklist_visitors" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'banned',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "resident_id" INTEGER,
    "last_name" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "security_id" INTEGER,

    CONSTRAINT "banned_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors_schedule" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "visitor_first_name" VARCHAR(255) NOT NULL,
    "visitor_phone" VARCHAR(20) NOT NULL,
    "visitor_id_type" VARCHAR(50) NOT NULL,
    "visitor_id_number" VARCHAR(50) NOT NULL,
    "visitor_email" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "visitor_type" VARCHAR(100) NOT NULL,
    "visitor_last_name" VARCHAR(50) NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "visitor_entry_date" DATE NOT NULL,
    "visitor_exit_date" DATE NOT NULL,
    "visitor_qrcode" VARCHAR(255),
    "visitor_qrcode_url" VARCHAR(255),
    "visitor_qrcode_path" VARCHAR(255),

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_log" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "security_id" INTEGER NOT NULL,
    "scanned_in_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanned_out_at" TIMESTAMP(6),

    CONSTRAINT "resident_entry_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "address" VARCHAR(50) NOT NULL,
    "house_number" VARCHAR(50) NOT NULL,
    "qr_code" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "address" VARCHAR(50) NOT NULL,
    "qr_code" VARCHAR(50) NOT NULL,
    "access_point" INTEGER NOT NULL,
    "shift" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "security_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "id_1741109275836_index" ON "blacklist_visitors"("id");

-- CreateIndex
CREATE INDEX "resident_id_1741109286975_index" ON "blacklist_visitors"("resident_id");

-- CreateIndex
CREATE INDEX "security_id_1741109281378_index" ON "blacklist_visitors"("security_id");

-- CreateIndex
CREATE INDEX "id_1741109513648_index" ON "visitors_schedule"("id");

-- CreateIndex
CREATE INDEX "resident_id_1741109518675_index" ON "visitors_schedule"("resident_id");

-- CreateIndex
CREATE INDEX "id_1741109306799_index" ON "entry_log"("id");

-- CreateIndex
CREATE INDEX "resident_id_1741109310532_index" ON "entry_log"("resident_id");

-- CreateIndex
CREATE INDEX "security_id_1741109315077_index" ON "entry_log"("security_id");

-- CreateIndex
CREATE INDEX "user_id_1741109050324_index" ON "resident"("user_id");

-- CreateIndex
CREATE INDEX "id_1741109369290_index" ON "resident"("id");

-- CreateIndex
CREATE INDEX "id_1741109407459_index" ON "security"("id");

-- CreateIndex
CREATE INDEX "user_id_1741109413061_index" ON "security"("user_id");

-- CreateIndex
CREATE INDEX "id_1741109294265_index" ON "access_points"("id");

-- CreateIndex
CREATE INDEX "id_1741109327221_index" ON "login_log"("id");

-- CreateIndex
CREATE INDEX "id_1741109344869_index" ON "notifications"("id");

-- CreateIndex
CREATE INDEX "resident_id_1741109348633_index" ON "notifications"("resident_id");

-- CreateIndex
CREATE INDEX "security_id_1741109354388_index" ON "notifications"("security_id");

-- CreateIndex
CREATE INDEX "resident_id_1741109065767_index" ON "resident_vehicle"("resident_id");

-- CreateIndex
CREATE INDEX "id_1741109394620_index" ON "resident_vehicle"("id");

-- CreateIndex
CREATE INDEX "id_1741109104433_index" ON "users"("id");

-- CreateIndex
CREATE INDEX "idx_entry_logs_visitor_id" ON "visitor_entry_logs"("visitor_schedule_id");

-- CreateIndex
CREATE INDEX "access_point_id_1741109472869_index" ON "visitor_entry_logs"("access_point_id");

-- CreateIndex
CREATE INDEX "id_1741109463966_index" ON "visitor_entry_logs"("id");

-- CreateIndex
CREATE INDEX "security_id_1741109482417_index" ON "visitor_entry_logs"("security_id");

-- CreateIndex
CREATE INDEX "id_1741109448583_index" ON "visitor_feedback"("id");

-- CreateIndex
CREATE INDEX "visitor_schedule_id_1741109451844_index" ON "visitor_feedback"("visitor_schedule_id");

-- AddForeignKey
ALTER TABLE "blacklist_visitors" ADD CONSTRAINT "blacklist_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist_visitors" ADD CONSTRAINT "blacklist_securityid" FOREIGN KEY ("security_id") REFERENCES "security"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_log" ADD CONSTRAINT "loginlog_userid" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_securityid" FOREIGN KEY ("security_id") REFERENCES "security"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitorentrylog_vscheduleid" FOREIGN KEY ("visitor_schedule_id") REFERENCES "visitors_schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitoryentrylog_accesspointid" FOREIGN KEY ("access_point_id") REFERENCES "access_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_feedback" ADD CONSTRAINT "visitorfeedback_vscheduleid" FOREIGN KEY ("visitor_schedule_id") REFERENCES "visitors_schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors_schedule" ADD CONSTRAINT "vistorschedule_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_log" ADD CONSTRAINT "entrylog_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_log" ADD CONSTRAINT "entrylog_securityid" FOREIGN KEY ("security_id") REFERENCES "security"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident" ADD CONSTRAINT "resident_userid" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_vehicle" ADD CONSTRAINT "residentvehicle_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security" ADD CONSTRAINT "accesspoint_id" FOREIGN KEY ("access_point") REFERENCES "access_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security" ADD CONSTRAINT "security_userid" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
