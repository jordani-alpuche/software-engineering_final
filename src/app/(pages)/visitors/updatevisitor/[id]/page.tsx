import React from "react";
import UpdateVisitors from "@/app/components/visitors/individual/update-visitors"; // Adjust path if necessary
import UpdateGroupVisitors from "@/app/components/visitors/group/update-visitors"; // Adjust path if necessary
import { getSchedule } from "@/app/api/visitors/[id]/route";
import { notFound } from "next/navigation";

const UpdateVisitor = async ({ params }) => {
  const { id: scheduleId } = await params;

  const scheduleGetData = (await getSchedule(scheduleId)) || {};
  // console.log("scheduleGetData", await scheduleGetData.sg_type);

  if (Object.keys(scheduleGetData).length === 0) {
    return notFound();
  } else {
    if (scheduleGetData.sg_type === 0) {
      return (
        <UpdateVisitors
          scheduleData={scheduleGetData}
          scheduleID={scheduleId}
        />
      );
    } else if (scheduleGetData.sg_type === 1) {
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
