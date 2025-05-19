import React from "react";
import ListVisitors from "@/app/components/visitors/list-visitors";
import { visitorsInfo } from "@/lib/serverActions/visitors/list/ListVisitorActions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import { redirect } from "next/navigation";
async function visitors () {
  const session = await getServerSession(authOptions); // Get the session from NextAuth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const visitorData = (await visitorsInfo()) || []; // Fetch visitor data from the API

  return (
    <div>
      <ListVisitors visitorInformation={visitorData} />{" "}
      {/* Pass the visitorData to ListVisitors component */}
    </div>
  );
};

export default visitors;
