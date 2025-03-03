-- CreateTable
CREATE TABLE "access_points" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banned_visitors" (
    "id" SERIAL NOT NULL,
    "visitor_id" INTEGER,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) DEFAULT 'banned',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banned_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "message" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'unread',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "visitor_id" INTEGER,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "visitor_first_name" VARCHAR(255) NOT NULL,
    "visitor_phone" VARCHAR(20) NOT NULL,
    "visitor_id_type" VARCHAR(50) NOT NULL,
    "visitor_id_number" VARCHAR(50) NOT NULL,
    "visitor_email" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "visitor_type" VARCHAR(100),
    "visitor_dob" VARCHAR(255),
    "visitor_last_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_entry_logs" (
    "id" SERIAL NOT NULL,
    "visitor_id" INTEGER NOT NULL,
    "qr_code_id" INTEGER,
    "security_id" INTEGER,
    "entry_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "access_point_id" INTEGER,

    CONSTRAINT "entry_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident_vehicle" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "vehicle_make" VARCHAR(50),
    "vehicle_model" VARCHAR(50),
    "vehicle_color" VARCHAR(20),
    "license_plate" VARCHAR(20),

    CONSTRAINT "visitor_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" SERIAL NOT NULL,
    "resident_first_name" TEXT NOT NULL,
    "resident_last_name" TEXT NOT NULL,
    "resident_house_number" TEXT NOT NULL,
    "resident_address" VARCHAR(555),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "resident_phone_number" VARCHAR(20) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_guards" (
    "id" SERIAL NOT NULL,
    "create_time" DATE,
    "security_first_name" VARCHAR(100) NOT NULL,
    "security_last_name" VARCHAR(100) NOT NULL,
    "security_phone_number" VARCHAR(20) NOT NULL,
    "security_shift" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_guards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_schedule" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER,
    "visitor_id" INTEGER,
    "scheduled_date" DATE NOT NULL,
    "scheduled_time_in" VARCHAR(255) NOT NULL,
    "scheduled_time_out" VARCHAR(255) NOT NULL,
    "is_recurring" BOOLEAN DEFAULT false,
    "recurrence_pattern" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "qr_code" TEXT,
    "license_plate" VARCHAR(20),

    CONSTRAINT "visitor_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident_entry_log" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER,
    "security_id" INTEGER,
    "scanned_in_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "scanned_out_at" TIMESTAMP(6),

    CONSTRAINT "resident_entry_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_feedback" (
    "id" SERIAL NOT NULL,
    "visitor_id" INTEGER,
    "schedule_id" INTEGER,
    "rating" INTEGER,
    "comments" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "ip_address" VARCHAR(255) NOT NULL,
    "login_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_time" TIMESTAMP(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'success',

    CONSTRAINT "login_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_access_points_name" ON "access_points"("name");

-- CreateIndex
CREATE INDEX "idx_banned_visitors_visitor_id" ON "banned_visitors"("visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "idx_qr_codes_visitor_id" ON "qr_codes"("visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key1" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_entry_logs_visitor_id" ON "visitor_entry_logs"("visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "residents"("resident_last_name");

-- CreateIndex
CREATE UNIQUE INDEX "security_guards_phone_number_key" ON "security_guards"("security_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_schedule_qr_code_key" ON "visitor_schedule"("qr_code");

-- CreateIndex
CREATE INDEX "idx_login_log_user_id" ON "login_log"("user_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitor_entry_logs_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitor_entry_logs_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitor_entry_logs_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_entry_logs" ADD CONSTRAINT "visitor_entry_logs_access_point_id_fkey" FOREIGN KEY ("access_point_id") REFERENCES "access_points"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_vehicle" ADD CONSTRAINT "resident_vehicle_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_schedule" ADD CONSTRAINT "visitor_schedule_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_schedule" ADD CONSTRAINT "visitor_schedule_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resident_entry_log" ADD CONSTRAINT "resident_entry_log_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resident_entry_log" ADD CONSTRAINT "resident_entry_log_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "security_guards"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_feedback" ADD CONSTRAINT "visitor_feedback_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "visitor_schedule"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitor_feedback" ADD CONSTRAINT "visitor_feedback_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "login_log" ADD CONSTRAINT "login_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
