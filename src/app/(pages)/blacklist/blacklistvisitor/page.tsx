import React from "react";
import BlacklistVisitor from "@/app/components/blacklist/create-update-blacklistvisitor";
import { getVisitors } from "@/app/api/visitors/[id]/route";
import { getblacklistInfo } from "@/app/api/blacklist/list/route";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import notfound from "@/app/404"; // Import the notfound component
import AlreadyExists from "@/app/exists";

const page = async ({
  searchParams,
}: {
  searchParams: { vid: string; c: string };
}) => {
  // Extract the vid from the searchParams (query string)
  const { vid, c } = await searchParams;
  const visitorId = Number(vid);
  let visitorData;
  console.log("value of c: ", typeof c); // Log the value of c

  // Validate vid
  if (!vid || isNaN(Number(vid))) {
    // console.error("Invalid or missing vid query parameter:", vid);
    return notfound(); // Redirect to 404 page if vid is invalid or missing
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return redirect("/api/auth/signin");
  }

  if (c === "true") {
    // Fetch the visitor data based on ID
    visitorData = await getVisitors(visitorId); // Fetch the visitor data based on ID

    // console.log("Visitor data create:", visitorData); // Log the fetched visitor data
  } else if (c === "false") {
    visitorData = await getblacklistInfo(visitorId); // Fetch the visitor data based on ID
    // console.log("Visitor data update:", visitorData); // Log the fetched visitor data
  }

  console.log("Visitor data:", visitorData); // Log the fetched visitor data
  // If visitor data is found, return the component to create blacklist
  if (!visitorData) {
    // console.error("Visitor data not found for ID:", visitorId);
    return notfound(); // Redirect to 404 page if visitor data is not found
  } else if (visitorData === "exists") {
    return <AlreadyExists />; // Redirect to already exists page if visitor is already blacklisted
  }
  // const userid = session?.user.id;
  return <BlacklistVisitor visitorData={visitorData} type={c} />;
};

export default page;
