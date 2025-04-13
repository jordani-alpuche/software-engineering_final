import React from "react";
import ViewVisitors from "@/app/components/visitors/view-visitors";
import { getSchedule } from "@/app/api/visitors/[id]/route";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import notfound from "@/app/404"; // Import the notfound component

const page = async ({ params }) => {
  const { id: scheduleId } = await params; // Extract the schedule ID from the params

  const session = await getServerSession(authOptions); // Get the session from NextAuth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const scheduleGetData = (await getSchedule(scheduleId)) || {}; // Fetch schedule data based on the schedule ID
  const userid = session?.user.id; // Get the user ID from the session

  // console.log("Schedule Data:", scheduleGetData);

  if (Object.keys(scheduleGetData).length === 0) {
    // Check if scheduleGetData is empty
    return notfound();
  } else {
    return <ViewVisitors scheduleData={scheduleGetData} userid={userid} />;
  }
};

export default page;
