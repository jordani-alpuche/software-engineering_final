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
import { deleteSchedule } from "@/lib/serverActions/visitors/[id]/route";

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

export default function ListVisitors({ visitorInformation }) {
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
        setData(visitorInformation);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  type User = {
    id: number;
    visitor_phone: string;
    visitor_email: string;
    status: string;
    visitor_type: string;
    license_plate: string;
    visitor_entry_date: string;
    visitor_exit_date: string;
    comments: string;
    sg_type: number;
    visitiors: [
      {
        blacklist_visitors: {
          id: number;
          visitor_id: number;
          reason: string;
          status: string;
        };

        visitor_first_name: string;
        visitor_last_name: string;
        visitor_id_type: string;
        visitor_id_number: string;
      }
    ];
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "visitor_first_name",
      header: "Visitor First Name",
      accessorFn: (row) => row.visitiors?.[0]?.visitor_first_name ?? "N/A",
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
            {visitorsArray?.[0]?.visitor_last_name || "N/A"}
          </div>
        );
      },
    },

    {
      accessorKey: "license_plate",
      header: "License Plate",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("license_plate")}</div>
      ),
    },

    {
      accessorKey: "visitor_type",
      header: "Visitor Type",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("visitor_type")}</div>
      ),
    },
    {
      accessorKey: "sg_type",
      header: "Single or Group",
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("sg_type") === 0 ? " Single Visitor" : "Group Visitor"}
        </div>
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
                  router.push(`/visitors/viewvisitor/${schedule.id}`)
                }
              >
                View Schedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/visitors/updatevisitor/${schedule.id}`)
                }
              >
                Update Schedule
              </DropdownMenuItem>
              <DropdownMenuItem
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
              </DropdownMenuItem>
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
      <h1 className="text-4xl font-bold text-center mb-6">List Visitors</h1>
      <div className="flex items-center py-4">
        {/* {console.log(table.getAllColumns())} */}
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
