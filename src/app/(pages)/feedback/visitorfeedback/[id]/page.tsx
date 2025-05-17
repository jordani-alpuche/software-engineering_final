import React from "react";
import CreateFeedback from "@/app/components/feedback/create-feedback";
import { getVisitorSchedule } from "@/lib/serverActions/feedback/[id]/route";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";
import notfound from "@/app/404"; // Import the notfound component
import FeedbackAlreadyExists from "@/app/feedbackexists"; // Import the feedback already exists component
import { get } from "http";

const page = async ({ params }) => {
  const { id } = await params; // Extract the id from the params (URL parameters)

  const session = await getServerSession(authOptions); // Get session from next-auth
  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }

  const userid = session?.user.id; // Get the user ID from the session
  const getScheduleData = (await getVisitorSchedule(id)) || {}; // Fetch the schedule data based on ID

  if (getScheduleData === "exists") {
    // Check if feedback already exists
    return FeedbackAlreadyExists(); // Return the feedback already exists component
  }

  if (Object.keys(getScheduleData).length === 0) {
    // Check if schedule data is empty
    return notfound(); // Redirect to 404 page if schedule data is not found
  } else {
    return (
      <div>
        <CreateFeedback scheduleData={getScheduleData} />{" "}
        {/* Pass the fetched schedule data to the component */}
      </div>
    );
  }
};

export default page;
