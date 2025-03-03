/*
  Warnings:

  - Added the required column `user_id` to the `banned_visitors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banned_visitors" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "idx_banned_visitors_user_id" ON "banned_visitors"("user_id");

-- AddForeignKey
ALTER TABLE "banned_visitors" ADD CONSTRAINT "banned_visitors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
