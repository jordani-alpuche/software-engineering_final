import React from "react";
import BlacklistVisitors from "@/app/components/blacklist/list-blacklistvisitor";
import { blacklistInfo } from "@/lib/serverActions/blacklist/list/route";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import { redirect } from "next/navigation";

async function visitors() {
  const session = await getServerSession(authOptions); // get session from next-auth

  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }

  const blacklistData = (await blacklistInfo()) || []; // Fetch blacklist data from the API


  return (
    <div>
      <BlacklistVisitors blacklistData={blacklistData} />{" "}
      {/* Pass the fetched blacklist data to the component */}
    </div>
  );
};

export default visitors; // Export the visitors component as default
