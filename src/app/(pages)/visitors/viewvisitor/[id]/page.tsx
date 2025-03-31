import React from "react";
import ViewVisitors from "@/app/components/visitors/view-visitors";
import { getSchedule } from "@/app/api/visitors/[id]/route";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const page = async ({ params }) => {
  const { id: scheduleId } = await params;

  const scheduleGetData = (await getSchedule(scheduleId)) || {};
  const session = await getServerSession(authOptions);
  const userid = session?.user.id;

  // console.log("Schedule Data:", scheduleGetData);

  if (Object.keys(scheduleGetData).length === 0) {
    return notFound();
  } else {
    return <ViewVisitors scheduleData={scheduleGetData} userid={userid} />;
  }
};

export default page;
