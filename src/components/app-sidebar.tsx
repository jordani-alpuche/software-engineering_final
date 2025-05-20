"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  Frame,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { NavMain } from "@/components/nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const navMain = [
    {
      title: "Visitors",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      roles: ["admin", "resident", "security"],
      items: [
        {
          title: "New Individual Visitor Schedule",
          url: "/visitors/newIndividualVisitor",
          roles: ["resident", "admin"],
        },
        {
          title: "New Group Visitor Schedule",
          url: "/visitors/newGroupVisitor",
          roles: ["resident", "admin"],
        },
        {
          title: "List Vistors",
          url: "/visitors/listvisitors",
          roles: ["admin", "security", "resident"],
        },
        {
          title: "Vistor Log",
          url: "/visitors/vistorlog",
          roles: ["admin", "resident", "security"],
        },
      ],
    },
    {
      title: "Scan",
      url: "#",
      icon: Settings2,
      isActive: true,
      roles: ["admin", "security"],
      items: [
        {
          title: "Visitor QR Code Scanner",
          url: "/scan",
          roles: ["admin", "security"],
        },
      ],
    },
    {
      title: "Blacklist",
      url: "#",
      icon: Frame,
      isActive: true,
      roles: ["admin", "security"],
      items: [
        {
          title: "New Blacklist Visitor",
          url: "/blacklist/selectvisitor",
          roles: ["admin"],
        },
        {
          title: "List Blacklist Visitor",
          url: "/blacklist/listblacklistvisitor",
          roles: ["admin", "security"],
        },
      ],
    },
    {
      title: "Feedback",
      url: "#",
      icon: Settings2,
      roles: ["admin", "resident"],
      items: [
        {
          title: "List Feedback",
          url: "/feedback/listfeedback",
          roles: ["admin", "resident"],
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: Settings2,
      roles: ["admin"],
      items: [
        {
          title: "Create User",
          url: "/users/createuser",
          roles: ["admin"],
        },
        {
          title: "View Users",
          url: "/users/listusers",
          roles: ["admin"],
        },
      ],
    },
  ];

  const filteredNavMain = navMain
    .filter((section) => !section.roles || section.roles.includes(role))
    .map((section) => ({
      ...section,
      items: section.items?.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gate Community</span>
                  <span className="truncate text-xs">Home for the future</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => signOut()}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogOut className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
