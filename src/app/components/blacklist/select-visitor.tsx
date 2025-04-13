"use client"; // Ensures the component is rendered on the client side

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
import CreateBlacklistUser from "./create-update-blacklistvisitor"; // Modal or component for handling blacklist create/update

// Renders placeholder loading rows while the actual data is being fetched
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

// Main component: Displays a list of existing visitors in a searchable, paginated, and sortable table
export default function SelectVisitorToBlacklist({ visitorsData, userid }) {
  const [data, setData] = React.useState([]); // Actual data to be displayed in the table
  const [loading, setLoading] = React.useState(true); // UI flag for loading state
  const [sorting, setSorting] = React.useState<SortingState>([]); // Keeps track of current sort configuration
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ); // Keeps track of column filters
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({}); // Controls visibility of table columns

  const router = useRouter(); // Next.js router for navigation

  // Fetch data only once when the component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setData(visitorsData); // Assign the prop data to local state
      } catch (error) {
        console.error("Error fetching data:", error); // Error handling
      } finally {
        setLoading(false); // Disable loading spinner
      }
    };
    fetchData();
  }, []);

  // Define the structure of a single visitor
  type User = {
    id: number;
    visitor_first_name: string;
    visitor_last_name: string;
    visitor_id_type: string;
    visitor_id_number: string;
    visitor_schedule_id: number;
  };

  // Define all table columns including how data should be rendered per column
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "visitor_first_name", // Column key from the data
      header: "Visitor First Name",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_first_name")}</div>
      ),
    },
    {
      accessorKey: "visitor_last_name",
      header: "Visitor Last Name",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_last_name")}</div>
      ),
    },
    {
      accessorKey: "visitor_id_type",
      header: "ID Type",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_id_type")}</div>
      ),
    },
    {
      accessorKey: "visitor_id_number",
      header: "ID Number",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_id_number")}</div>
      ),
    },
    {
      id: "actions", // Special column for row-specific actions
      enableHiding: false, // This column should always be visible
      header: "Actions",
      cell: ({ row }) => {
        const visitors = row.original; // The actual row data

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
                onClick={() => {
                  // Redirect user to blacklist creation page with visitor ID in query
                  router.push(
                    `/blacklist/blacklistvisitor?vid=${encodeURIComponent(
                      visitors.id.toString()
                    )}&c=true`
                  );
                }}
              >
                Add to Blacklist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Setup the TanStack table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(), // Basic row model
    getPaginationRowModel: getPaginationRowModel(), // Enable pagination support
    getSortedRowModel: getSortedRowModel(), // Enable sorting
    getFilteredRowModel: getFilteredRowModel(), // Enable filtering
    onSortingChange: setSorting, // Attach sorting state
    onColumnFiltersChange: setColumnFilters, // Attach filter state
    onColumnVisibilityChange: setColumnVisibility, // Attach column visibility state
    state: { sorting, columnFilters, columnVisibility }, // Local state values used by the table
  });

  return (
    <div className="p-4 md:p-7 lg:p-8">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-center mb-6">Existing Visitors</h1>

      {/* Filter box for first name */}
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

      {/* Table container with horizontal scroll */}
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
            {/* If loading, show placeholder rows */}
            {loading ? (
              Array(6)
                .fill(0)
                .map((_, index) => <SkeletonRow key={index} />)
            ) : table.getRowModel().rows.length ? (
              // Render each row in the table
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
              // No matching records
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

      {/* Pagination Controls */}
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
