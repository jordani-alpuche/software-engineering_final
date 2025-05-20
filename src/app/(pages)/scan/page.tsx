import React from "react";
import QRScanner from "@/app/components/scan/scanner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic
import { redirect } from "next/navigation";

const page = async () => {

    const session = await getServerSession(authOptions); // Get session from next-auth
    if (!session || !session.user?.id) {
      // Check if session exists and user ID is present
      // Redirect to login page if session has expired
      return redirect("/api/auth/signin"); // Redirect to the sign-in page
    }

  return (
    <div>
      <QRScanner /> {/* QRScanner component for scanning QR codes */}
    </div>
  );
};

export default page;
