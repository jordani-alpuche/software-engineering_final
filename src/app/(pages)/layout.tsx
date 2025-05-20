// app/layout.tsx
"use client";
// Inside your <header> tag in app/layout.tsx
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import {getAllUnReadNotifications} from "@/lib/serverActions/notifications/viewNotifications";

interface LayoutProps {
  children: ReactNode; // This will be the dynamic content for each page
}

export default function Layout({ children }:LayoutProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications/unread");
      const data = await res.json();
      setNotifications(data.map((n: any) => n.message));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }

  fetchNotifications();
}, []);


  const unreadCount = notifications.length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex justify-between h-16 items-center gap-2 px-4 bg-white shadow">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Welcome {session?.user.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-4 text-sm font-medium text-gray-700 border-b">
                  Notifications
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((note, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        {note}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      No new notifications
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
