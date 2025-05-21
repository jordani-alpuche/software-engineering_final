"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import {
  getAllUnReadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/serverActions/notifications/viewNotifications";
import { AppSidebarFooter } from "@/components/sidebar-footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = session?.user?.role;
//  console.log("User Role:", userRole);
  const isPrivileged = userRole === "admin" || userRole === "security";
  const unreadCount = notifications.length;

  // Fetch notifications only for allowed roles
  useEffect(() => {
    if (!isPrivileged || !session?.user?.id) return;

    const fetchNotifications = async () => {
      const fetched = await getAllUnReadNotifications();
      if (fetched) setNotifications(fetched);
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 3000);

    return () => clearInterval(intervalId);
  }, [session, isPrivileged]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    const updated = await getAllUnReadNotifications();
    if (updated) setNotifications(updated);
  };

  const handleMarkAllAsRead = async () => {
    if (session?.user?.id) {
      await markAllNotificationsAsRead(Number(session.user.id));
      const updated = await getAllUnReadNotifications();
      if (updated) setNotifications(updated);
    }
  };

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
                  <BreadcrumbLink href="#">Welcome {session?.user.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {isPrivileged && (
            <div className="relative" ref={dropdownRef}>
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
                  <div className="p-4 flex justify-between items-center border-b">
                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                    {unreadCount > 0 && (
                      <Button
                        variant="link"
                        className="text-xs p-0 h-auto"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((note) => (
                        <li
                          key={note.id}
                          className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                          onClick={() => handleNotificationClick(note.id)}
                        >
                          {note.message}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-500">No new notifications</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </header>

        <main>{children}</main>

        
      </SidebarInset>
    </SidebarProvider>
  );
}
