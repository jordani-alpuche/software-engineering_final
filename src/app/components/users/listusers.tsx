"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { deleteUser } from "@/app/api/users/[id]/route";
import { DataTable } from "@/components/ui/data-table";

export type User = {
  id: number;
  username: string;
  created_at: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
};

interface ListUsersProps {
  userInformation: User[];
}

export default function ListUsers({ userInformation }: ListUsersProps) {
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    setLoading(false);
  }, []);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "first_name",
      header: "First Name",
      cell: ({ row }) => <div>{row.getValue("first_name") || "N/A"}</div>,
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
      cell: ({ row }) => <div>{row.getValue("last_name") || "N/A"}</div>,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("username")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("status") || "-"}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "User Role",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("role")}</div>
      ),
    },
  ];

  const actions = [
    {
      label: "Update User",
      onClick: (user: User) => router.push(`/users/updateuser/${user.id}`),
    },
    {
      label: "Delete User",
      onClick: async (user: User) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
          const result = await deleteUser(user.id);
          if (result.success) {
            alert("User deleted successfully");
            // You might want to refresh the data here
          } else {
            alert("Error deleting user");
          }
        }
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={userInformation}
      loading={loading}
      filterColumn="first_name"
      filterPlaceholder="Filter by first name..."
      actions={actions}
    />
  );
}
