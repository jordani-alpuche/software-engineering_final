import React from "react";
import VisitorsLog from "@/app/components/visitors/visitor-log";
import { visitorsLog } from "@/lib/serverActions/visitors/entrylog/route";
async function page(){
  const visitorLog = (await visitorsLog()) || []; // Fetch the visitor log data from the API

  return (
    <div>
      <VisitorsLog visitorLog={visitorLog} />
    </div>
  );
};

export default page;
