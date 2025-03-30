import React from "react";
import { getServerSession } from "next-auth/next";
import CreateVisitors from "@/app/components/visitors/individual/create-visitors";

import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
// export default async function Page() {

// }
const Create = async (props) => {
  const session = await getServerSession(authOptions);
  const userid = session?.user.id;
  // console.log("session1",session?.user.id)
  //  console.log("session 2", JSON.stringify(session, null, 2))

  return (
    <div>
      <CreateVisitors userID={userid} />
    </div>
  );
};

export default Create;
