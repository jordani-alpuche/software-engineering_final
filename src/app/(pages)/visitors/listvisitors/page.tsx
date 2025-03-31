import React from "react";
import ListVisitors from "@/app/components/visitors/list-visitors";
import { visitorsInfo } from "@/app/api/visitors/list/route";

const visitors = async (props) => {
  const visitorData = (await visitorsInfo()) || [];
  // console.log("visitorData", visitorData);

  return (
    <div>
      <ListVisitors visitorInformation={visitorData} />
    </div>
  );
};

export default visitors;
