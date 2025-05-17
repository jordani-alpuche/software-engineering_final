import React from "react";
import UpdateUsers from "@/app/components/users/update-user";

import { getUsers } from "@/lib/serverActions/users/[id]/route";

const UpdateUser = async ({ params }) => {
  const { id: userId } = await params;

  const userData = (await getUsers(userId)) || {};

  return (
    <div>
      <UpdateUsers userData={userData} />
      {/* Pass the userData to UpdateUsers component */}
    </div>
  );
};

export default UpdateUser;
