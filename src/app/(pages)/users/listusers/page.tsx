import React from "react";
import ListUsers from "@/app/components/users/listusers";
import { usersInfo } from "@/app/api/users/list/route";
const page = async () => {
  const userData = (await usersInfo()) || [];
  // console.log(JSON.stringify(userData, null, 2));
  // console.log("usersdata", userData);

  return (
    <div>
      <ListUsers userInformation={userData} />
      {/* Pass the userData to ListUsers component */}
    </div>
  );
};

export default page;
