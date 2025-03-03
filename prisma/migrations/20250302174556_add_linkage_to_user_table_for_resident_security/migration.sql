/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `residents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `security_guards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `residents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `security_guards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "residents" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "security_guards" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "residents_user_id_key" ON "residents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "security_guards_user_id_key" ON "security_guards"("user_id");

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_guards" ADD CONSTRAINT "security_guards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
