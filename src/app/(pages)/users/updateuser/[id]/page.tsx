import React from "react";
import UpdateUsers from "@/app/components/users/update-user";

import { getUsers } from "@/lib/serverActions/users/update/UpdateUsersActions";

const UpdateUser = async ( props: {params?: Promise<{ id: string }>;}) => {

const params = await props.params;
  const params_id = await params?.id;
const userId = Number(params_id);
  const userData = (await getUsers(userId)) || {};

  return (
    <div>
      <UpdateUsers userData={userData} />
      {/* Pass the userData to UpdateUsers component */}
    </div>
  );
};

export default UpdateUser;
