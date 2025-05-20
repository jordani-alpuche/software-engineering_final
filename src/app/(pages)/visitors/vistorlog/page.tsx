import React from "react";
import VisitorsLog from "@/app/components/visitors/visitor-log";
import { visitorsLog } from "@/lib/serverActions/visitors/entrylog/EntryLogActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
async function page(){

  const session = await getServerSession(authOptions); // Get session from next-auth
  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }

  const visitorLog = (await visitorsLog()) || []; // Fetch the visitor log data from the API

  return (
    <div>
      <VisitorsLog visitorLog={visitorLog} />
    </div>
  );
};

export default page;
