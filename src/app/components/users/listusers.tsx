"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // Import the router
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Skeletor Loader
const SkeletonRow = () => (
  <TableRow>
    {Array(6)
      .fill(0)
      .map((_, index) => (
        <TableCell key={index}>
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </TableCell>
      ))}
  </TableRow>
);

export type User = {
  id: string;
  username: string;
  created_at: string;
  role: string;
  status: string;
};

export const columns: ColumnDef<User>[] = [
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
  // {
  //   accessorKey: "first_name",
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //     >
  //       First Name <ArrowUpDown />
  //     </Button>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="lowercase">{row.getValue("first_name")}</div>
  //   ),
  // },
  // {
  //   accessorKey: "last_name",
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //     >
  //       Last Name <ArrowUpDown />
  //     </Button>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="lowercase">{row.getValue("last_name") || "-"}</div>
  //   ),
  // },
  {
    accessorKey: "role",
    header: "User Role",
    cell: ({ row }) => <div className="lowercase">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Created Date",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("created_at")}</div>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const router = useRouter(); // Initialize router
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/users/updateuser/${user.id}`)}
            >
              Update User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this user?")
                ) {
                  deleteUser(user.id);
                }
              }}
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const deleteUser = async (id: string) => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("User deleted successfully");
      window.location.reload(); // Reloads the page to reflect the changes
    } else {
      alert("Error deleting user");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting user");
  }
};

export default function ListUsers() {
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true); // Add loading state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users/list");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  return (
    <div className="p-4 md:p-7 lg:p-8">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Username..."
          value={
            (table.getColumn("username")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show Skeletor loader if loading is true
              Array(6)
                .fill(0)
                .map((_, index) => <SkeletonRow key={index} />)
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
