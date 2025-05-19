import React from "react";
import ViewVisitors from "@/app/components/visitors/view-visitors";
import { getSchedule } from "@/lib/serverActions/visitors/[id]/route";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import notfound from "@/app/404"; // Import the notfound component
import { ScheduleData } from "@/app/types/interfaces"; // Import the ScheduleData interface
const page = async (
  props: {params?: Promise<{ id: string }>;}) => {
  const params = await props.params; // Get the search parameters from the props
  const  params_id  = await params?.id; // Extract the id from the params (URL parameters)
const scheduleId = Number(params_id); // Convert the id to a number


  const session = await getServerSession(authOptions); // Get the session from NextAuth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }
  const scheduleGetData = (await getSchedule(scheduleId)) as ScheduleData | null; // Fetch schedule data based on the schedule ID
  const userid = Number(session?.user.id); // Get the user ID from the session

  if (!scheduleGetData) {
  return notfound(); // Return 404 if no data found
    }
  
  // console.log("Schedule Data:", scheduleGetData);

  if (Object.keys(scheduleGetData).length === 0) {
    // Check if scheduleGetData is empty
    return notfound();
  } else {
    return <ViewVisitors scheduleData={scheduleGetData} userid={userid} />;
  }
};

export default page;
