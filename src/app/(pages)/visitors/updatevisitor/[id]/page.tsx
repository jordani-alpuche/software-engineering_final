import React from "react";
import UpdateVisitors from "@/app/components/visitors/individual/update-visitors"; // Adjust path if necessary
import UpdateGroupVisitors from "@/app/components/visitors/group/update-visitors"; // Adjust path if necessary
import { getSchedule } from "@/app/api/visitors/[id]/route";
import { notFound } from "next/navigation";

const UpdateVisitor = async ({ params }) => {
  const { id: scheduleId } = await params; // Extracting the scheduleId from params

  const scheduleGetData = (await getSchedule(scheduleId)) || {}; // Fetching schedule data based on the scheduleId
  // console.log("scheduleGetData", await scheduleGetData.sg_type);

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
