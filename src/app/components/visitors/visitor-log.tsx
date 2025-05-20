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

export default function VisitorsLog({ visitorLog }:any) {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setData(visitorLog);
      } catch (error) {
        // console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  type User = {
    id: number;
    security_id: number;
    entry_time: string;
    exit_time: string;
    entry_type: string;
    visitor_schedule_id: number;
    visitiors: {
      visitor_first_name: string;
      visitor_last_name: string;
      visitor_id_type: string;
      visitor_id_number: string;
    };
  };

  const columns: ColumnDef<User>[] = [
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
      cell: ({ row }) => {
        const visitorsArray = row.original.visitiors;
        return (
          <div className="lowercase">
            {visitorsArray?.visitor_last_name || "N/A"}
          </div>
        );
      },
    },

    {
      accessorKey: "entry_time",
      header: "Entry Time",
      cell: ({ row }) => {
        const entryTime = new Date(row.getValue("entry_time"));
        return <div className="lowercase">{entryTime.toLocaleString()}</div>;
      },
    },

    {
  accessorKey: "exit_time",
  header: "Exit Time",
  cell: ({ row }) => {
    const exitTime = row.getValue("exit_time");

    const dateValue =
      exitTime && typeof exitTime === "string"
        ? new Date(exitTime)
        : exitTime instanceof Date
        ? exitTime
        : null;

    return (
      <div className="lowercase">
        {dateValue ? dateValue.toLocaleString() : "N/A"}
      </div>
    );
  },
},


    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("status") || "-"}</div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const schedule = row.original;

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
                onClick={() =>
                  router.push(
                    `/visitors/viewvisitor/${schedule.visitor_schedule_id}`
                  )
                }
              >
                View Schedule
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                onClick={() =>
                  router.push(`/visitors/updatevisitor/${schedule.id}`)
                }
              >
                Update Schedule
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this schedule?"
                    )
                  ) {
                    const scheduleDelete = await deleteSchedule(schedule.id);
                    if (scheduleDelete.success) {
                      alert("Schedule deleted successfully");
                      setData((prevData) =>
                        prevData.filter((u) => u.id !== schedule.id)
                      );
                    } else {
                      alert("Error deleting Schedule");
                    }
                  }
                }}
              >
                Delete Schedule
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
    {/* Page Title */}
    <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
      Visitor Log
    </h1>

    {/* Filter Input */}
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
        className="max-w-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
      />
    </div>

    {/* Table Container */}
    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-100 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wider px-4 py-3"
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
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="text-gray-800 dark:text-gray-200 px-4 py-3"
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

    {/* Pagination Controls */}
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="bg-white hover:bg-indigo-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="bg-white hover:bg-indigo-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        Next
      </Button>
    </div>
  </div>
);

}
