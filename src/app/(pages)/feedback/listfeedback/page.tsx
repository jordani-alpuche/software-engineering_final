import React from "react";
import ListVisitorFeedback from "@/app/components/feedback/list-feedback";
import { getAllVisitorFeedback } from "@/lib/serverActions/feedback/gets/GetFeebackActions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import { redirect } from "next/navigation";
async function page() {
  const session = await getServerSession(authOptions); // Get session from next-auth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const feedbackData = (await getAllVisitorFeedback()) || []; // Fetch all visitor feedback data from the API

  return (
    <div>
      <ListVisitorFeedback visitorFeedbackInformation={feedbackData} />{" "}
      {/* Pass the fetched feedback data to the component */}
    </div>
  );
};

export default page;
