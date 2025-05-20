import React from "react";
import SelectVisitorToBlacklist from "@/app/components/blacklist/select-visitor";
import { getAllVisitors } from "@/lib/serverActions/visitors/update/UpdateVisitorActions";
import {  redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
async function page()  {
  const session = await getServerSession(authOptions); // Get session from next-auth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const visitorGetData = (await getAllVisitors()) || {}; // Fetch all visitors data from the API
  const userid = session?.user.id; // Get the user ID from the session

  

    return (
      <SelectVisitorToBlacklist visitorsData={visitorGetData} userid={userid} /> // Pass the fetched visitor data to the component
    );
 
};

export default page;
