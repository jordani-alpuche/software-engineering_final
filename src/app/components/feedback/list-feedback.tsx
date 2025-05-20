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
import { deleteSchedule } from "@/lib/serverActions/visitors/update/UpdateVisitorActions";

// Skeleton row to show loading state for the table
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

export default function ListVisitorFeedback({ visitorFeedbackInformation }:any) {
  // Initialize state variables
  const [data, setData] = React.useState([]); // Data for the table
  const [loading, setLoading] = React.useState(true); // Loading state
  const [sorting, setSorting] = React.useState<SortingState>([]); // Sorting state for table columns
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ); // Filters for columns
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({}); // Visibility for table columns

  // Router for navigation
  const router = useRouter();

  // Effect hook to fetch data when the component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching feedback information passed as prop
        setData(visitorFeedbackInformation);
      } catch (error) {
        console.error("Error fetching data:", error); // Log error in case of failure
      } finally {
        setLoading(false); // Set loading to false after data fetch completes
      }
    };
    fetchData();
  }, []); // Empty dependency array, runs only once after initial render

  // Defining the structure for feedback data
  type Feedback = {
    id: number;
    rating: number;
    comments: string;
    visitor_schedule_id: number;
    visitors_schedule: {
      visitor_entry_date: string;
      visitor_exit_date: string;
      visitor_email: string;
      visitor_phone: string;
      license_plate: string;
      sg_type: number; // Single or Group visitor
    };
  };

  // Columns for the table
  const columns: ColumnDef<Feedback>[] = [
    {
      id: "rating", // Column ID for rating
      header: "Rating", // Column header
      accessorFn: (row) => row.rating, // Accessor function for rating
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("rating")}</div>
      ), // Render rating value
    },
    {
      id: "comments", // Column ID for comments
      header: "Comments", // Column header
      accessorFn: (row) => row.comments, // Accessor function for comments
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("comments")}</div>
      ), // Render comments value
    },

    {
      id: "visitor_license_plate", // Column for visitor's license plate
      header: "Visitor License Plate", // Column header
      accessorFn: (row) => row.visitors_schedule?.license_plate, // Accessor function for license plate
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_license_plate")}</div>
      ), // Render license plate value
    },

    {
      accessorKey: "visitor_email", // Column for visitor's email
      header: "Visitor Email", // Column header
      accessorFn: (row) => row.visitors_schedule?.visitor_email, // Accessor function for email
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_email")}</div>
      ), // Render email value
    },
    {
      accessorKey: "sg_type", // Column for single or group visitor
      header: "Single or Group", // Column header
      accessorFn: (row) => row.visitors_schedule?.sg_type, // Accessor function for visitor type
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("sg_type") === 0 ? " Single Visitor" : "Group Visitor"}
        </div>
      ), // Render type (Single or Group) value
    },

    {
      id: "actions", // Column for actions (e.g., menu actions)
      enableHiding: false, // Prevent hiding this column
      header: "Actions", // Column header
      cell: ({ row }) => {
        const feedback = row.original; // Get the original row data (schedule)
        return (
          <DropdownMenu>
            {" "}
            {/* Dropdown menu for actions */}
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal /> {/* Icon for menu */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/feedback/viewvisitorfeedback/${feedback.id}`)}
            >
              View Feedback
            </DropdownMenuItem>
                        <DropdownMenuItem
              onClick={() => router.push(`/visitors/viewvisitor/${feedback.visitor_schedule_id}`)}
            >
              Visitor Schedule
            </DropdownMenuItem>
              {/* Placeholder for potential menu items */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Using react-table hook to manage table state and behavior
  const table = useReactTable({
    data, // Data for the table
    columns, // Columns configuration
    getCoreRowModel: getCoreRowModel(), // Core row model for basic table functionality
    getPaginationRowModel: getPaginationRowModel(), // Pagination model for table
    getSortedRowModel: getSortedRowModel(), // Sorting model for table
    getFilteredRowModel: getFilteredRowModel(), // Filtering model for table
    onSortingChange: setSorting, // Handler for sorting change
    onColumnFiltersChange: setColumnFilters, // Handler for column filters change
    onColumnVisibilityChange: setColumnVisibility, // Handler for column visibility change
    state: { sorting, columnFilters, columnVisibility }, // Current table state
  });

return (
  <div className="p-4 md:p-7 lg:p-8">
    <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-white">
      Feedback Given
    </h1>

    {/* Table container */}
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md bg-white dark:bg-gray-900">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-100 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-gray-700 dark:text-gray-200 text-sm font-semibold uppercase tracking-wider px-4 py-3"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, index) => <SkeletonRow key={index} />)
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                className={
                  rowIndex % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="text-gray-700 dark:text-gray-300 px-4 py-3"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-500 dark:text-gray-400"
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
        className="bg-white hover:bg-indigo-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="bg-white hover:bg-indigo-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        Next
      </Button>
    </div>
  </div>
);

}
