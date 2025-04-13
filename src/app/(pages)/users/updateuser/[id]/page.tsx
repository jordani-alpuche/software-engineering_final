import React from "react";
import UpdateUsers from "@/app/components/users/update-user";

import { getUsers } from "@/app/api/users/[id]/route";

const UpdateUser = async ({ params }: { params: { id: number } }) => {
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
