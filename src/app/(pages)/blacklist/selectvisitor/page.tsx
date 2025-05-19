import React from "react";
import SelectVisitorToBlacklist from "@/app/components/blacklist/select-visitor";
import { getAllVisitors } from "@/lib/serverActions/visitors/[id]/route";
import {  redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import notfound from "@/app/404"; // Import the notfound component

async function page()  {
  const session = await getServerSession(authOptions); // Get session from next-auth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const visitorGetData = (await getAllVisitors()) || {}; // Fetch all visitors data from the API
  const userid = session?.user.id; // Get the user ID from the session

  
  if (Object.keys(visitorGetData).length === 0) {
    // Check if visitor data is empty
    return notfound(); // Redirect to 404 page if visitor data is not found
  } else {
    return (
      <SelectVisitorToBlacklist visitorsData={visitorGetData} userid={userid} /> // Pass the fetched visitor data to the component
    );
  }
};

export default page;
