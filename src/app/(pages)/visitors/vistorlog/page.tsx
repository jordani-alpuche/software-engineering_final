import React from "react";
import VisitorsLog from "@/app/components/visitors/visitor-log";
import { visitorsLog } from "@/app/api/visitors/entrylog/route";

const page = async (props) => {
  const visitorLog = (await visitorsLog()) || [];

  // console.log("visitorLog", visitorLog);
  return (
    <div>
      <VisitorsLog visitorLog={visitorLog} />
    </div>
  );
};

export default page;
