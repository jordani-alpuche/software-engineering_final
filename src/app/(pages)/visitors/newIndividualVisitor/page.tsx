import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";
import CreateVisitors from "@/app/components/visitors/individual/create-visitors";
const Create = async () => {

  
 const session = await getServerSession(authOptions); // Get session from next-auth
  if (!session || !session.user?.id) {
    // Check if session exists and user ID is present
    // Redirect to login page if session has expired
    return redirect("/api/auth/signin"); // Redirect to the sign-in page
  }
  const userid = session?.user.id; // Get the user ID from the session
  // console.log("session1",session?.user.id)
  //  console.log("session 2", JSON.stringify(session, null, 2))

  return (
    <div>
      <CreateVisitors userID={userid} />
    </div>
  );
};

export default Create;
