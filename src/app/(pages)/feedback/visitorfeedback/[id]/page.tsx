import React from "react";
import CreateFeedback from "@/app/components/feedback/create-feedback";
import { getVisitorSchedule } from "@/app/api/feedback/[id]/route";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";
import notfound from "@/app/404"; // Import the notfound component
import FeedbackAlreadyExists from "@/app/feedbackexists"; // Import the feedback already exists component
import { get } from "http";

const page = async ({ params }) => {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const userid = session?.user.id;
  const getScheduleData = (await getVisitorSchedule(id)) || {};

  if (getScheduleData === "exists") {
    return FeedbackAlreadyExists(); // Return the feedback already exists component
  }

  if (Object.keys(getScheduleData).length === 0) {
    return notfound();
  } else {
    return (
      <div>
        <CreateFeedback scheduleData={getScheduleData} />
      </div>
    );
  }
};

export default page;
