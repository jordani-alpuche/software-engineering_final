"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
// import PieComponent from "@/app/components/dashboard-graph/chart/piechart";
import { PieComponent } from "@/app/components/dashboardgraph/chart/piechart";
import { BarComponent } from "@/app/components/dashboardgraph/chart/barchart";
import { InteractiveChart } from "@/app/components/dashboardgraph/chart/barchartinteractive";
import { PieChartInteractive } from "@/app/components/dashboardgraph/chart/piechartinteractive";
export default function Dashboard() {
  const { data: session } = useSession();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000); // 4000ms = 4 seconds

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {showContent ? (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50">
              <PieComponent />
            </div>
            <div className="aspect-video rounded-xl bg-muted/50">
              <BarComponent />
            </div>
            <div className="aspect-video rounded-xl bg-muted/50">
              <PieChartInteractive />
            </div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <InteractiveChart />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      )}
    </div>
  );
}
