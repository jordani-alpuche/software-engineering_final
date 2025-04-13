"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { PieComponent } from "@/app/components/dashboardgraph/chart/piechart";
import { BarComponent } from "@/app/components/dashboardgraph/chart/barchart";
import { InteractiveChart } from "@/app/components/dashboardgraph/chart/barchartinteractive";
import { PieChartInteractive } from "@/app/components/dashboardgraph/chart/piechartinteractive";
import Wrapper from "../wrapper";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/loading";

export default function Dashboard() {
  const { data: session, status } = useSession(); // Get session data and status from next-auth
  const [showContent, setShowContent] = useState(false); // State to control content visibility
  const router = useRouter(); // Router for navigation

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000); // Delay content rendering for 1 second

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if user is authenticated
      const expTime = session?.expires // Get session expiration time
        ? new Date(session.expires).getTime()
        : 0; // Default to 0 if expiration time is not available
      const currentTime = new Date().getTime(); // Get current time

      if (expTime && expTime < currentTime) {
        // Check if session is expired
        signOut(); // Log out if expired
      }
    }
  }, [session, status]); // Check session expiration

  if (status === "loading") {
    // Show loading state while session is loading
    return <Loading />; // Loading component
  }

  if (status === "unauthenticated") {
    // Redirect to login if unauthenticated
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Session expired. Redirecting...</p>
      </div>
    );
  }

  return (
    // Main dashboard content
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {showContent ? (
        <>
          <Wrapper>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-muted/50">
                <PieComponent />
              </div>
              <div className="rounded-xl bg-muted/50">
                <BarComponent />
              </div>
              <div className="rounded-xl bg-muted/50">
                <PieChartInteractive />
              </div>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min mt-4">
              <InteractiveChart />
            </div>
          </Wrapper>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}
