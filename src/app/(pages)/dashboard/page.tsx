// "use client";
// import { useEffect, useState } from "react";
// import { useSession, signOut } from "next-auth/react";
// // import PieComponent from "@/app/components/dashboard-graph/chart/piechart";
// import { PieComponent } from "@/app/components/dashboardgraph/chart/piechart";
// import { BarComponent } from "@/app/components/dashboardgraph/chart/barchart";
// import { InteractiveChart } from "@/app/components/dashboardgraph/chart/barchartinteractive";
// import { PieChartInteractive } from "@/app/components/dashboardgraph/chart/piechartinteractive";
// import Wrapper from "../wrapper";

// export default function Dashboard() {
//   const { data: session } = useSession();
//   const [showContent, setShowContent] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowContent(true);
//     }, 1000); // 4000ms = 4 seconds

//     return () => clearTimeout(timer); // Clean up the timer on component unmount
//   }, []);

//   return (
//     <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//       {showContent ? (
//         <>
//           <Wrapper>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//               <div className="rounded-xl bg-muted/50">
//                 <PieComponent />
//               </div>
//               <div className="rounded-xl bg-muted/50">
//                 <BarComponent />
//               </div>
//               <div className="rounded-xl bg-muted/50">
//                 <PieChartInteractive />
//               </div>
//             </div>
//             <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min mt-4">
//               <InteractiveChart />
//             </div>
//           </Wrapper>
//         </>
//       ) : (
//         <div className="flex justify-center items-center h-screen">
//           Loading...
//         </div>
//       )}
//     </div>
//   );
// }

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
  const { data: session, status } = useSession();
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const expTime = session?.expires
        ? new Date(session.expires).getTime()
        : 0;
      const currentTime = new Date().getTime();

      if (expTime && expTime < currentTime) {
        signOut(); // Log out if expired
      }
    }
  }, [session, status]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Session expired. Redirecting...</p>
      </div>
    );
  }

  return (
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
