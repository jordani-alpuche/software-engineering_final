import React from "react";
import BlacklistVisitors from "@/app/components/blacklist/list-blacklistvisitor";
import { blacklistInfo } from "@/app/api/blacklist/list/route";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import { redirect } from "next/navigation";
import notfound from "@/app/404"; // Import the notfound component

const visitors = async (props) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const blacklistData = (await blacklistInfo()) || [];

  // console.log("visitorData", visitorData);

  return (
    <div>
      <BlacklistVisitors blacklistData={blacklistData} />
    </div>
  );
};

export default visitors;
