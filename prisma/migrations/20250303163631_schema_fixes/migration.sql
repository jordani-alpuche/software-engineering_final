/*
  Warnings:

  - A unique constraint covering the columns `[license_plate]` on the table `resident_vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitor_entry_logs_security_id_fkey";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "resident_vehicle" ALTER COLUMN "license_plate" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_usersTovisitor_entry_logs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_usersTovisitor_entry_logs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_usersTovisitor_entry_logs_B_index" ON "_usersTovisitor_entry_logs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "resident_vehicle_license_plate_key" ON "resident_vehicle"("license_plate");

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitor_entry_logs_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "security_guards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_usersTovisitor_entry_logs" ADD CONSTRAINT "_usersTovisitor_entry_logs_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_usersTovisitor_entry_logs" ADD CONSTRAINT "_usersTovisitor_entry_logs_B_fkey" FOREIGN KEY ("B") REFERENCES "visitor_entry_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
