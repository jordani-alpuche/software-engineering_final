import React from "react";
import ListVisitors from "@/app/components/visitors/list-visitors";
import { visitorsInfo } from "@/app/api/visitors/list/route";


const visitors = async () => {

  const visitorData = (await visitorsInfo()) || [];

  return (
    <div>
      <ListVisitors visitorInformation = {visitorData} />
    </div>
  );
};






export default visitors;
