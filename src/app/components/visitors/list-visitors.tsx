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
import { sendEmail } from "@/app/utils/sendEmail";
import { useSession } from "next-auth/react";


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

export default function ListVisitors({ visitorInformation }:any) {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const router = useRouter();
  const { data: session } = useSession();
const role = session?.user?.role ?? ""; // fallback to empty string if undefined


  const handleSendEmail = async (visitorEmail: string, qr_code_url: string, emailType: string,entryDate:string | Date,exitDate:string | Date) => {
    setLoading(true);
    const res = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorEmail: visitorEmail,
        qr_code_url: qr_code_url,
        emailType: emailType,
        enterDate: entryDate,
        exitDate: exitDate,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Email sent!");
    } else {
      alert("Failed to send email.");
    }
  };


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

  type VisitorSchedule = {
    id: number;
    visitor_phone: string;
    visitor_email: string;
    status: string;
    visitor_type: string;
    license_plate: string;
    visitor_entry_date: Date;
    visitor_exit_date: Date;
    visitor_qrcode: string;
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

  const columns: ColumnDef<VisitorSchedule>[] = [
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
        // console.log("Schedule:", schedule);

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
                 {(
                  (schedule.status === 'inactive' && role === 'admin') ||
                  (schedule.status !== 'inactive' && ['admin', 'resident'].includes(role))
                 ) && (
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/visitors/updatevisitor/${schedule.id}`)
                }
              >
                Update Schedule
              </DropdownMenuItem>
              )}

          {["admin","resident"].includes(role) && schedule.status !== 'inactive' && (
            // if (schedule.status !== "inactive"){
              <DropdownMenuItem
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to resend this email?"
                    )
                  ) {                    
                     handleSendEmail(schedule.visitor_email, schedule.visitor_qrcode,"visitor", schedule.visitor_entry_date, schedule.visitor_exit_date);
                  }
                }}
              >
                Resend Email
              </DropdownMenuItem>
            // }
              )}

              {["admin"].includes(role) && (
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
                        prevData.filter((u:any) => u.id !== schedule.id)
                      );
                    } else {
                      alert("Error deleting Schedule");
                    }
                  }
                }}
              >
                Delete Schedule
              </DropdownMenuItem>
              )}
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
    <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
      List Visitors
    </h1>

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
