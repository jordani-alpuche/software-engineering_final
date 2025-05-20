import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";
import CreateVisitors from "@/app/components/visitors/group/create-visitors";

const Create = async () => {
  const session = await getServerSession(authOptions);
  const userid = session?.user.id; // Get the user ID from the session
  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }


  return (
    <div>
      <CreateVisitors userID={userid} />
      {/* Pass the userID to CreateVisitors component */}
    </div>
  );
};

export default Create;
