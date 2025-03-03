/*
  Warnings:

  - Made the column `visitor_id` on table `banned_visitors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "banned_visitors" ALTER COLUMN "visitor_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "banned_visitors" ADD CONSTRAINT "banned_visitors_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
