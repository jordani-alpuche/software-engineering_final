import React from "react";
import BlacklistVisitor from "@/app/components/blacklist/create-update-blacklistvisitor";
import { getVisitors } from "@/lib/serverActions/visitors/[id]/route";
import { getblacklistInfo } from "@/lib/serverActions/blacklist/list/route";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import notfound from "@/app/404"; // Import the notfound component
import AlreadyExists from "@/app/exists";
import { BlackListVisitorsProps } from "@/app/types/interfaces";

const page = async ({
  searchParams,
}: {
  searchParams?: { vid: string; c: string };
}) => {
  // const { vid, c } = searchParams;
  const vid = await searchParams?.vid; // Get the vid from search parameters
  const c = await searchParams?.c; // Get the c from search parameters
  const visitorId = Number(vid);
  let visitorData;
  // console.log("value of c: ", typeof c); // Log the value of c

  // Validate vid
  if (!vid || isNaN(Number(vid))) {
    // console.error("Invalid or missing vid query parameter:", vid);
    return notfound(); // Redirect to 404 page if vid is invalid or missing
  }

  const session = await getServerSession(authOptions); // Get session from next-auth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    return redirect("/api/auth/signin"); // Redirect to the sign-in page if session has expired
  }

  if (c === "true") {
    // Check if c is "true" then create blacklist
    // Fetch the visitor data based on ID
    visitorData = await getVisitors(visitorId); // Fetch the visitor data based on ID

    // console.log("Visitor data create:", visitorData); // Log the fetched visitor data
  } else if (c === "false") {
    // Check if c is "false" then update blacklist
    visitorData = await getblacklistInfo(visitorId); // Fetch the visitor data based on ID
    // console.log("Visitor data update:", visitorData); // Log the fetched visitor data
  }

  console.log("Visitor data:", visitorData); // Log the fetched visitor data
  // If visitor data is found, return the component to create blacklist
  if (!visitorData) {
    // Check if visitor data is not found
    // console.error("Visitor data not found for ID:", visitorId);
    return notfound(); // Redirect to 404 page if visitor data is not found
  } else if (visitorData === "exists") {
    return <AlreadyExists />; // Redirect to already exists page if visitor is already blacklisted
  }
  // const userid = session?.user.id;
  return <BlacklistVisitor visitorData={visitorData} type={c} />; // Pass the fetched visitor data to the component
};

export default page;
