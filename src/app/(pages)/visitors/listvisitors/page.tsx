import React from "react";
import ListVisitors from "@/app/components/visitors/list-visitors";
import { visitorsInfo } from "@/lib/serverActions/visitors/list/route";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import { redirect } from "next/navigation";
import notfound from "@/app/404"; // Import the notfound component

const visitors = async (props) => {
  const session = await getServerSession(authOptions); // Get the session from NextAuth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const visitorData = (await visitorsInfo()) || []; // Fetch visitor data from the API
  console.log("visitorData", visitorData); // Log the visitor data for debugging

  return (
    <div>
      <ListVisitors visitorInformation={visitorData} />{" "}
      {/* Pass the visitorData to ListVisitors component */}
    </div>
  );
};

export default visitors;
