import React from "react";
import CreateFeedback from "@/app/components/feedback/create-feedback";
import { getVisitorSchedule } from "@/lib/serverActions/feedback/gets/GetFeebackActions";
import notfound from "@/app/errors/404/page"; // Import the notfound component
import FeedbackAlreadyExists from "@/app/feedbackexists"; // Import the feedback already exists component
const page = async ( props: {params?: Promise<{ id: string }>;}) => {

  const params = await props.params; // Get the search parameters from the props
  const  params_id  = await params?.id; // Extract the id from the params (URL parameters)
const id = Number(params_id); // Convert the id to a number


  const getScheduleData = (await getVisitorSchedule(id)) || {}; // Fetch the schedule data based on ID
  console.log("getScheduleData", getScheduleData); // Log the fetched schedule data for debugging

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
