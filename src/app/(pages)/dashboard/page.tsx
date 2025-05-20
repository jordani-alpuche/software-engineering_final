"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { VisitorCountPieChart } from "@/app/components/dashboardgraph/chart/piechart";
import Wrapper from "../wrapper";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/loading";
import { DonutCounter } from "@/components/circular-count";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();
  const [totalActiveVisitors, setTotalActiveVisitors] = useState<number | null>(null);
  const [totalUnActiveVisitors, setTotalUnActiveVisitors] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const expTime = session.expires ? new Date(session.expires).getTime() : 0;
      const currentTime = new Date().getTime();

      if (expTime && expTime < currentTime) {
        signOut();
      }
    }
  }, [session, status]);

  useEffect(() => {
    async function fetchTotalActiveVisitors() {
      try {
        const res = await fetch("/api/dashboard/active");
        if (!res.ok) throw new Error("Failed to fetch active visitors");
        const data = await res.json();
        setTotalActiveVisitors(data.totalActiveVisitorsSchedule);
      } catch (error) {
        console.error("Error fetching active visitors:", error);
        setTotalActiveVisitors(0);
      }
    }
    fetchTotalActiveVisitors();
  }, []);

  useEffect(() => {
    async function fetchTotalUnactiveVisitors() {
      try {
        const res = await fetch("/api/dashboard/unactive");
        if (!res.ok) throw new Error("Failed to fetch unactive visitors");
        const data = await res.json();
        setTotalUnActiveVisitors(data.totalUnActiveVisitorsSchedule);
      } catch (error) {
        console.error("Error fetching unactive visitors:", error);
        setTotalUnActiveVisitors(0);
      }
    }
    fetchTotalUnactiveVisitors();
  }, []);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Session expired or not authenticated. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {showContent ? (
        <>
          {/* Welcome and System Overview Section */}
          <div className="bg-white text-gray-800 p-8 rounded-lg shadow-md mb-6 border border-gray-200">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-center tracking-tight text-gray-900">
              Welcome to Your Gate Management Dashboard!
            </h1>
            <p className="text-base md:text-lg text-center opacity-90 mb-6 max-w-3xl mx-auto">
              This is a robust <strong className="font-semibold text-blue-600">Gate Management System</strong> designed to streamline operations
              for residents and security personnel alike. Built with cutting-edge technologies
              like <strong className="font-semibold text-blue-600">Next.js 15</strong>, <strong className="font-semibold text-blue-600">Prisma ORM</strong>, and <strong className="font-semibold text-blue-600">PostgreSQL</strong>, it offers comprehensive
              control and insightful analytics.
            </p>
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Key Features at a Glance:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-4xl mx-auto">
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">NextAuth.js Authentication:</strong> Secure and flexible user login.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Visitor Scheduling:</strong> Effortlessly manage individual and group visits.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Entry & Exit Logs:</strong> Keep detailed records of all movements.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Blacklist Management:</strong> Enhanced security with restricted access control.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Resident Vehicles Management:</strong> Track and manage resident vehicles.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Security and Resident Roles:</strong> Tailored access and functionalities for each user type.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Visitor Feedback:</strong> Collect insights to improve visitor experience.
                </p>
                <p className="flex items-start gap-2 text-gray-700 text-base">
                  <span className="text-blue-500 text-xl font-bold">&#8226;</span>
                  <strong className="font-semibold">Dashboard Charts:</strong> Visualize key data for quick decision-making.
                </p>
              </div>
            </div>
          </div>
          {/* End Welcome and System Overview Section */}

          <Wrapper>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-4">
                <DonutCounter count={totalActiveVisitors ?? 0} label="Total Active Visitor Schedules" />
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <DonutCounter count={totalUnActiveVisitors ?? 0} label="Total Inactive Visitor Schedules" />
              </div>
              <div className="rounded-xl bg-muted/50">
                <VisitorCountPieChart />
              </div>
            </div>
          </Wrapper>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}
