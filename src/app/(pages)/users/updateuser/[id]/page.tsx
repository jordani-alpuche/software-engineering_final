import React from "react";
import UpdateUsers from "@/app/components/users/update-user";

import { getUsers } from "@/lib/serverActions/users/update/UpdateUsersActions";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic

const UpdateUser = async ( props: {params?: Promise<{ id: string }>;}) => {

    const session = await getServerSession(authOptions); // Get session from next-auth
    if (!session || !session.user?.id ) {
      // Check if session exists and user ID is present
      // Redirect to login page if session has expired
      return redirect("/api/auth/signin"); // Redirect to the sign-in page
    }


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
