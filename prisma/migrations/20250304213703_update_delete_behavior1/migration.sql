-- DropForeignKey
ALTER TABLE "blacklist_visitors" DROP CONSTRAINT "blacklist_residentid";

-- DropForeignKey
ALTER TABLE "blacklist_visitors" DROP CONSTRAINT "blacklist_securityid";

-- DropForeignKey
ALTER TABLE "entry_log" DROP CONSTRAINT "entrylog_residentid";

-- DropForeignKey
ALTER TABLE "entry_log" DROP CONSTRAINT "entrylog_securityid";

-- DropForeignKey
ALTER TABLE "login_log" DROP CONSTRAINT "loginlog_userid";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notification_residentid";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notification_securityid";

-- DropForeignKey
ALTER TABLE "resident" DROP CONSTRAINT "resident_userid";

-- DropForeignKey
ALTER TABLE "resident_vehicle" DROP CONSTRAINT "residentvehicle_residentid";

-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitorentrylog_vscheduleid";

-- DropForeignKey
ALTER TABLE "visitor_entry_logs" DROP CONSTRAINT "visitoryentrylog_accesspointid";

-- DropForeignKey
ALTER TABLE "visitor_feedback" DROP CONSTRAINT "visitorfeedback_vscheduleid";

-- DropForeignKey
ALTER TABLE "visitors_schedule" DROP CONSTRAINT "vistorschedule_residentid";

-- AddForeignKey
ALTER TABLE "blacklist_visitors" ADD CONSTRAINT "blacklist_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist_visitors" ADD CONSTRAINT "blacklist_securityid" FOREIGN KEY ("security_id") REFERENCES "security"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_log" ADD CONSTRAINT "loginlog_userid" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_securityid" FOREIGN KEY ("security_id") REFERENCES "security"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitorentrylog_vscheduleid" FOREIGN KEY ("visitor_schedule_id") REFERENCES "visitors_schedule"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitoryentrylog_accesspointid" FOREIGN KEY ("access_point_id") REFERENCES "access_points"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_feedback" ADD CONSTRAINT "visitorfeedback_vscheduleid" FOREIGN KEY ("visitor_schedule_id") REFERENCES "visitors_schedule"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors_schedule" ADD CONSTRAINT "vistorschedule_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_log" ADD CONSTRAINT "entrylog_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_log" ADD CONSTRAINT "entrylog_securityid" FOREIGN KEY ("security_id") REFERENCES "security"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident" ADD CONSTRAINT "resident_userid" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_vehicle" ADD CONSTRAINT "residentvehicle_residentid" FOREIGN KEY ("resident_id") REFERENCES "resident"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
