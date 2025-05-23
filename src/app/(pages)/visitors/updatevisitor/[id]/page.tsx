import React from "react";
import UpdateVisitors from "@/app/components/visitors/individual/update-visitors"; // Adjust path if necessary
import UpdateGroupVisitors from "@/app/components/visitors/group/update-visitors"; // Adjust path if necessary
import { getSchedule } from "@/lib/serverActions/visitors/update/UpdateVisitorActions";
import { notFound } from "next/navigation";
import {ScheduleData} from "@/app/types/interfaces"; // Import the ScheduleData interface
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";
const UpdateVisitor = async ( props: {params?: Promise<{ id: string }>;}) => {

const params = await props.params;
const params_id = await params?.id;
const scheduleId = Number(params_id);

  const session = await getServerSession(authOptions); // Get session from next-auth
  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }

  const scheduleGetData = (await getSchedule(scheduleId)) as ScheduleData | null; // Fetching schedule data based on the scheduleId


    if (!scheduleGetData) {
    return notFound(); // Return 404 if no data found
  }

  if (Object.keys(scheduleGetData).length === 0) {
    // Check if scheduleGetData is empty
    return notFound(); // Return 404 if no data found
  } else {
    if (scheduleGetData.sg_type === 0) {
      //check type of the schedule, 0 or individual, 1 or group
      return (
        <UpdateVisitors
          scheduleData={scheduleGetData}
          scheduleID={scheduleId}
        />
      );
    } else if (scheduleGetData.sg_type === 1) {
      //check type of the schedule, 0 or individual, 1 or group
      return (
        <UpdateGroupVisitors
          scheduleData={scheduleGetData}
          scheduleID={scheduleId}
        />
      );
    }
  }
};

export default UpdateVisitor;
