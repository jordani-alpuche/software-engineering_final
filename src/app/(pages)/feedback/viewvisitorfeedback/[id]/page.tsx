import React from "react";
import Viewfeedback from "@/app/components/feedback/view-feedback";
import { getSingleVisitorFeedback } from "@/lib/serverActions/feedback/gets/GetFeebackActions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";
import notfound from "@/app/errors/404/page"; // Import the notfound component
const page = async ( props: {params?: Promise<{ id: string }>;}) => {

  const params = await props.params; // Get the search parameters from the props
  const  params_id  = await params?.id; // Extract the id from the params (URL parameters)
const id = Number(params_id); // Convert the id to a number

  const session = await getServerSession(authOptions); // Get session from next-auth
  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }

  const getFeedbackData = (await getSingleVisitorFeedback(id)) || {}; // Fetch the schedule data based on ID and is viewing

  if (Object.keys(getFeedbackData).length === 0) {
    // Check if schedule data is empty
    return notfound(); // Redirect to 404 page if schedule data is not found
  } else {
    return (
      <div>
        <Viewfeedback feedbackData={getFeedbackData} />{" "}
        {/* Pass the fetched schedule data to the component */}
      </div>
    );
  }
};

export default page;
