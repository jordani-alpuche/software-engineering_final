import React from "react";
import SelectVisitorToBlacklist from "@/app/components/blacklist/select-visitor";
import { getAllVisitors } from "@/app/api/visitors/[id]/route";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import notfound from "@/app/404"; // Import the notfound component

const page = async (props) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin");
  }

  const visitorGetData = (await getAllVisitors()) || {};
  const userid = session?.user.id;

  // console.log("Visitor Data:", visitorGetData);
  // console.log("Schedule Data:", visitorGetData);

  if (Object.keys(visitorGetData).length === 0) {
    return notfound();
  } else {
    return (
      <SelectVisitorToBlacklist visitorsData={visitorGetData} userid={userid} />
    );
  }
};

export default page;
