import React from "react";
import ListVisitors from "@/app/components/visitors/list-visitors";
import { visitorsInfo } from "@/app/api/visitors/list/route";
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

  const visitorData = (await visitorsInfo()) || [];
  console.log("visitorData", visitorData);
  if (Object.keys(visitorData).length === 0) {
    return notfound();
  } else {
    return (
      <div>
        <ListVisitors visitorInformation={visitorData} />
      </div>
    );
  }
};

export default visitors;
