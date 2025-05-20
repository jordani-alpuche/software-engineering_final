import React from "react";
import ListUsers from "@/app/components/users/listusers";
import { usersInfo } from "@/lib/serverActions/users/list/ListUsersActions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file
import { redirect } from "next/navigation";

const page = async () => {

    const session = await getServerSession(authOptions); // Get the session from NextAuth
  
    if (!session || !session.user?.id || session.user.role !== "admin") {
      // Check if session exists and user ID is present
      // Redirect to login page if session has expired
      return redirect("/api/auth/signin");
    }
  

  const userData = (await usersInfo()) || [];
  // console.log(JSON.stringify(await userData, null, 2));
  // console.log("usersdata1", await userData);

  return (
    <div>
      <ListUsers userInformation={userData} />
      {/* Pass the userData to ListUsers component */}
    </div>
  );
};

export default page;
