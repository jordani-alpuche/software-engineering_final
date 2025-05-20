"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBlacklistVisitor } from "@/lib/serverActions/blacklist/delete/DeleteBlacklistAction";
import { useSession } from "next-auth/react";

// Skeleton loader row used when data is loading
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

export default function BlacklistVisitors({ blacklistData }: any) {
  const [data, setData] = React.useState([]); // Table data
  const [loading, setLoading] = React.useState(true); // Loading state
  const [sorting, setSorting] = React.useState<SortingState>([]); // Sorting state
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ); // Column filter state
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({}); // Visibility state

  const router = useRouter();
    const { data: session } = useSession();
const role = session?.user?.role ?? ""; // fallback to empty string if undefined


  // Load initial blacklist data on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setData(blacklistData); // Set the provided blacklist data
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false once done
      }
    };
    fetchData();
  }, []);

  // Define blacklist row structure
  type Blacklist = {
    id: number;
    visitor_id: number;
    reason: string;
    status: string;
    resident_id: number;
    security_id: number;
    visitiors: {
      visitor_first_name: string;
      visitor_last_name: string;
      visitor_id_type: string;
      visitor_id_number: string;
      visitor_schedule_id: number;
    };
  };

  // Define table columns with accessor functions and custom renderers
  const columns: ColumnDef<Blacklist>[] = [
    {
      id: "visitor_first_name",
      header: "Visitor First Name",
      accessorFn: (row) => row.visitiors?.visitor_first_name ?? "N/A",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_first_name")}</div>
      ),
    },
    {
      id: "visitor_last_name",
      header: "Visitor Last Name",
      accessorFn: (row) => row.visitiors?.visitor_last_name ?? "N/A",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_last_name")}</div>
      ),
    },
    {
      id: "visitor_id_type",
      header: "Visitor ID Type",
      accessorFn: (row) => row.visitiors?.visitor_id_type ?? "N/A",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_id_type")}</div>
      ),
    },
    {
      id: "visitor_id_number",
      header: "Visitor ID Number",
      accessorFn: (row) => row.visitiors?.visitor_id_number ?? "N/A",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_id_number")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("status")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const blacklist = row.original;

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

              {["admin"].includes(role) && (

              
              <DropdownMenuItem
                onClick={() => {
                  router.push(
                    `/blacklist/blacklistvisitor?vid=${encodeURIComponent(
                      blacklist.visitor_id.toString()
                    )}&c=false`
                  );
                }}
              >
                Update Blacklist Reason
              </DropdownMenuItem>
              )}
                
                {["admin"].includes(role) && (
              <DropdownMenuItem
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this blacklist visitor?"
                    )
                  ) {
                    const blacklistDelete = await deleteBlacklistVisitor(
                      blacklist.id
                    );
                    if (blacklistDelete.success) {
                      alert("blacklist visitor deleted successfully");
                      setData((prevData) =>
                        prevData.filter((u:any) => u.id !== blacklist.id)
                      );
                    } else {
                      alert("Error deleting blacklist visitor");
                    }
                  }
                }}
              >
                Delete Blacklist Visitor
              </DropdownMenuItem>
              )}
              

              {/* Placeholder for future action */}
              {/* <DropdownMenuItem>...</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Initialize react-table with defined states and row models
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
      <h1 className="text-4xl font-bold text-center mb-6">
        Blacklist Visitors
      </h1>

      {/* Filter input for visitor first name */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter First Name..."
          value={
            (table
              .getColumn("visitor_first_name")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("visitor_first_name")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      {/* Table UI */}
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
              // Show skeleton loaders while loading
              Array(6)
                .fill(0)
                .map((_, index) => <SkeletonRow key={index} />)
            ) : table.getRowModel().rows.length ? (
              // Show actual rows if data is present
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
              // Show message if no results
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

      {/* Pagination controls */}
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
