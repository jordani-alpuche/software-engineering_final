-- DropIndex
DROP INDEX "idx_access_points_name";

-- AlterTable
ALTER TABLE "security_guards" ADD COLUMN     "access_point_id" INTEGER;

-- AddForeignKey
ALTER TABLE "security_guards" ADD CONSTRAINT "security_guards_access_point_id_fkey" FOREIGN KEY ("access_point_id") REFERENCES "access_points"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
