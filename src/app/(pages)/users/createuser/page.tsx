import React from "react";
import UserCreation from "@/app/components/users/create-user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const page = async () => {

    const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return redirect("/errors/unauthorized") // Redirect to unauthorized page if not an admin
  }

  return (
    <div>
      <UserCreation /> {/* UserCreation component for creating a new user */}
    </div>
  );
};

export default page;
