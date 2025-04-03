"use client";
import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure CSS is imported
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

// --- Import the updated Server Action ---
import { updateEntryExitStatus } from "@/app/api/visitors/entry-exit/route"; // Adjust the import path to where your Server Action file is

// --- Define Types (copy from previous example or adapt) ---
interface Visitor {
  id: number;
  visitor_first_name?: string | null;
  visitor_last_name?: string | null;
  visitor_id_type?: string | null;
  visitor_id_number?: string | null;
}

interface VisitorLog {
  id: number;
  visitor_id: number;
  entry_time?: Date | string | null; // Allow string initially from JSON
  exit_time?: Date | string | null; // Allow string initially from JSON
}

interface ScheduleData {
  id: number;
  visitor_phone: string;
  visitor_email: string;
  license_plate: string;
  visitor_type: string; // "one-time" or "recurring"
  status?: string | null;
  visitor_entry_date: string | Date;
  visitor_exit_date: string | Date;
  comments?: string | null;
  visitor_qrcode?: string | null;
  visitiors: Visitor[];
  visitor_entry_logs: VisitorLog[];
}

interface VisitorCurrentStatus {
  visitorId: number;
  isInside: boolean;
  lastLogId: number | null;
}

// Define the expected result type from the Server Action
interface ActionResult {
  success: boolean;
  code: number;
  message: string;
  data?: any;
}

export default function ViewVisitors({
  scheduleData: initialScheduleData,
  userid,
}: {
  scheduleData: ScheduleData;
  userid: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Use state for schedule data to allow potential refresh without full reload
  const [scheduleData, setScheduleData] =
    useState<ScheduleData>(initialScheduleData);

  // --- State for One-Time Visitors ---
  const [visitorStatuses, setVisitorStatuses] = useState(() => {
    if (scheduleData.visitor_type === "one-time") {
      return (
        scheduleData.visitiors?.map((visitor) => {
          const log = scheduleData.visitor_entry_logs?.find(
            (log) => log.visitor_id === visitor.id
          );
          return {
            id: visitor.id,
            entry: !!log?.entry_time,
            exit: !!log?.exit_time,
          };
        }) || []
      );
    }
    return [];
  });

  // --- State for Recurring Visitors ---
  const [recurringVisitorStatus, setRecurringVisitorStatus] = useState<
    VisitorCurrentStatus[]
  >([]);

  // --- Effect to calculate recurring status ---
  useEffect(() => {
    if (scheduleData.visitor_type === "recurring") {
      const statusMap =
        scheduleData.visitiors?.map((visitor) => {
          const visitorLogs = scheduleData.visitor_entry_logs
            ?.filter((log) => log.visitor_id === visitor.id)
            // Ensure entry_time is treated as Date for comparison
            .sort(
              (a, b) =>
                new Date(b.entry_time || 0).getTime() -
                new Date(a.entry_time || 0).getTime()
            );

          const lastLog = visitorLogs?.[0];

          return {
            visitorId: visitor.id,
            isInside: !!lastLog && !lastLog.exit_time,
            lastLogId: lastLog?.id ?? null,
          };
        }) || [];
      setRecurringVisitorStatus(statusMap);
    }
    // Recalculate if scheduleData changes (e.g., after a refresh)
  }, [scheduleData]);

  // --- Handlers for One-Time ---
  const handleCheckboxChange = (visitorId: number, type: "entry" | "exit") => {
    setVisitorStatuses((prevStatuses) => {
      return prevStatuses.map((visitor) => {
        if (visitor.id === visitorId) {
          const updatedVisitor = { ...visitor, [type]: !visitor[type] };
          if (type === "entry" && !updatedVisitor.entry) {
            updatedVisitor.exit = false;
          }
          if (type === "exit" && updatedVisitor.exit) {
            updatedVisitor.entry = true;
          }
          return updatedVisitor;
        }
        return visitor;
      });
    });
  };

  // --- Handler for ONE-TIME visitor updates (loops through visitors) ---
  const handleUpdateStatus = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (scheduleData.visitor_type !== "one-time") return; // Should not be called for recurring

    setIsLoading(true);
    let allSuccessful = true;
    const errorMessages: string[] = [];

    // Loop through each visitor status and call the API individually
    for (const status of visitorStatuses) {
      try {
        const payload = {
          visitorId: status.id,
          scheduleId: scheduleData.id,
          securityId: userid,
          action: "updateOneTime" as const, // Explicitly set action type
          entryChecked: status.entry,
          exitChecked: status.exit,
        };

        console.log(`Calling API for one-time visitor ${status.id}:`, payload);
        // --- Directly call the Server Action ---
        const result: ActionResult = await updateEntryExitStatus(payload);
        console.log(`API Result for visitor ${status.id}:`, result);

        if (!result.success) {
          allSuccessful = false;
          const message = `Visitor ${status.id}: ${result.message}`;
          errorMessages.push(message);
          toast.error(message); // Show individual error toast
        }
      } catch (error: any) {
        allSuccessful = false;
        const message = `Visitor ${status.id}: Client-side error - ${error.message}`;
        errorMessages.push(message);
        toast.error(message);
        console.error(`Error updating status for visitor ${status.id}:`, error);
      }
    }

    if (allSuccessful) {
      toast.success("All one-time visitor statuses updated successfully!");
      // Refresh data - Simplest way is reload
      window.location.reload();
      // Better UX: Fetch updated data and call setScheduleData(newScheduleData);
    } else {
      toast.warning(
        "Some visitor statuses could not be updated. See individual errors."
      );
      // Optionally refresh even if there were partial errors
      // window.location.reload();
    }

    setIsLoading(false);
  };

  // --- Handler for RECURRING visitor actions (single action per call) ---
  const handleRecurringAction = async (
    visitorId: number,
    action: "logEntry" | "logExit"
  ) => {
    setIsLoading(true);
    try {
      const payload = {
        visitorId: visitorId,
        scheduleId: scheduleData.id,
        securityId: userid,
        action: action, // 'logEntry' or 'logExit' passed directly
      };

      console.log(
        `Calling API for recurring action '${action}' for visitor ${visitorId}:`,
        payload
      );
      // --- Directly call the Server Action ---
      const result: ActionResult = await updateEntryExitStatus(payload);
      console.log(
        `API Result for recurring action '${action}' for visitor ${visitorId}:`,
        result
      );

      if (result.success) {
        toast.success(
          result.message ||
            `Visitor ${
              action === "logEntry" ? "logged in" : "logged out"
            } successfully!`
        );
        // Refresh data - Simplest way is reload
        window.location.reload();
        // Better UX: Fetch updated data and call setScheduleData(newScheduleData);
      } else {
        toast.error(
          result.message ||
            `Error ${action === "logEntry" ? "logging in" : "logging out"}`
        );
      }
    } catch (error: any) {
      toast.error(
        `Client-side error during recurring action: ${error.message}`
      );
      console.error(
        `Error during recurring action '${action}' for visitor ${visitorId}:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get current status for a recurring visitor
  const getRecurringStatus = useCallback(
    (visitorId: number): VisitorCurrentStatus | undefined => {
      return recurringVisitorStatus.find((v) => v.visitorId === visitorId);
    },
    [recurringVisitorStatus]
  );

  // Helper to format dates/times or return placeholder
  const formatDateTime = (
    dateTime: Date | string | null | undefined
  ): string => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toString();
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <>
      {/* Use a general loading overlay or disable elements */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "2em",
          }}
        >
          Processing...
        </div>
      )}
      {/* Wrap the main content in a form ONLY if needed for the one-time submit button */}
      {/* Removed onSubmit={handleUpdateStatus} from form tag as it's triggered by button now */}
      <form className="p-6">
        <h1 className="text-3xl font-bold mb-6">Visitor Details</h1>

        {/* Visitor Details (No changes needed here) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 p-4 border rounded mb-6">
          <div>
            <p>
              <strong>Phone:</strong> {scheduleData.visitor_phone}
            </p>
          </div>
          <div>
            <p>
              <strong>Email:</strong> {scheduleData.visitor_email}
            </p>
          </div>
          <div>
            <p>
              <strong>License Plate:</strong>{" "}
              {scheduleData.license_plate || "N/A"}
            </p>
          </div>
          <div>
            <p>
              <strong>Visitor Type:</strong>{" "}
              <span
                className={`font-semibold ${
                  scheduleData.visitor_type === "recurring"
                    ? "text-purple-700"
                    : "text-blue-700"
                }`}
              >
                {scheduleData.visitor_type}
              </span>
            </p>
          </div>
          <div>
            <p>
              <strong>Status:</strong> {scheduleData.status || "N/A"}
            </p>
          </div>
        </div>
        {/* ... Dates, Comments, QR Code ... */}
        <div className="mt-6 space-y-4 mb-6 p-4 border rounded">
          <p>
            <strong>Scheduled Entry:</strong>{" "}
            {new Date(scheduleData.visitor_entry_date).toString()}
          </p>
          <p>
            <strong>Scheduled Exit:</strong>{" "}
            {new Date(scheduleData.visitor_exit_date).toString()}
          </p>
          {scheduleData.comments && (
            <p>
              <strong>Comments:</strong> {scheduleData.comments}
            </p>
          )}
        </div>
        {scheduleData.visitor_qrcode && (
          <div className="mt-6 mb-8 p-4 border rounded text-center">
            <h2 className="text-xl font-semibold mb-4">QRCode</h2>
            <div className="flex justify-center">
              <QRCodeCanvas value={scheduleData.visitor_qrcode} size={180} />
            </div>
          </div>
        )}

        {/* --- Visitor Table --- */}
        <h2 className="text-2xl font-semibold mt-8">Visitors on Schedule</h2>
        <div className="overflow-x-auto mt-4">
          <Table className="min-w-full border">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>ID Type</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead className="text-center">
                  {scheduleData.visitor_type === "one-time"
                    ? "Entry/Exit Status"
                    : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData.visitiors?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-4"
                  >
                    No visitors listed for this schedule.
                  </TableCell>
                </TableRow>
              )}
              {scheduleData.visitiors?.map((visitor, index) => {
                const currentStatus =
                  scheduleData.visitor_type === "recurring"
                    ? getRecurringStatus(visitor.id)
                    : undefined;
                const oneTimeStatus =
                  scheduleData.visitor_type === "one-time"
                    ? visitorStatuses.find((vs) => vs.id === visitor.id)
                    : undefined;

                return (
                  <TableRow
                    key={visitor.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell>{visitor.visitor_first_name || "N/A"}</TableCell>
                    <TableCell>{visitor.visitor_last_name || "N/A"}</TableCell>
                    <TableCell>{visitor.visitor_id_type || "N/A"}</TableCell>
                    <TableCell>{visitor.visitor_id_number || "N/A"}</TableCell>
                    <TableCell className="text-center">
                      {/* --- Conditional Rendering for Actions/Status --- */}
                      {scheduleData.visitor_type === "one-time" ? (
                        // --- One-Time Visitor Checkboxes ---
                        <div className="flex justify-center items-center space-x-4">
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-600"
                              checked={oneTimeStatus?.entry || false}
                              onChange={() =>
                                handleCheckboxChange(visitor.id, "entry")
                              }
                              disabled={isLoading}
                            />
                            <span>Entry</span>
                          </label>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-red-600"
                              checked={oneTimeStatus?.exit || false}
                              disabled={!oneTimeStatus?.entry || isLoading}
                              onChange={() =>
                                handleCheckboxChange(visitor.id, "exit")
                              }
                            />
                            <span>Exit</span>
                          </label>
                        </div>
                      ) : (
                        // --- Recurring Visitor Buttons ---
                        <div className="flex justify-center space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-700 hover:bg-green-50"
                            onClick={() =>
                              handleRecurringAction(visitor.id, "logEntry")
                            }
                            disabled={currentStatus?.isInside || isLoading}
                            aria-label={`Log entry for ${visitor.visitor_first_name}`}
                          >
                            Log Entry
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleRecurringAction(visitor.id, "logExit")
                            }
                            disabled={!currentStatus?.isInside || isLoading}
                            aria-label={`Log exit for ${visitor.visitor_first_name}`}
                          >
                            Log Exit
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* --- Log History Table (Good for both types) --- */}
        <h2 className="text-2xl font-semibold mt-10">Entry/Exit Log History</h2>
        <div className="overflow-x-auto mt-4">
          <Table className="min-w-full border">
            <TableHeader>
              <TableRow className="bg-gray-100">
                {/* <TableHead>Log ID</TableHead> */}
                <TableHead>Visitor Name</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData.visitor_entry_logs?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-gray-500 py-4"
                  >
                    No log entries yet.
                  </TableCell>
                </TableRow>
              )}
              {scheduleData.visitor_entry_logs
                ?.slice() // Create shallow copy before sorting to avoid mutating prop
                .sort(
                  (a, b) =>
                    new Date(b.entry_time || 0).getTime() -
                    new Date(a.entry_time || 0).getTime()
                ) // Sort by most recent entry
                .map((log) => {
                  const visitorInfo = scheduleData.visitiors.find(
                    (v) => v.id === log.visitor_id
                  );
                  const visitorName = visitorInfo
                    ? `${visitorInfo.visitor_first_name || ""} ${
                        visitorInfo.visitor_last_name || ""
                      }`.trim()
                    : `Visitor ID: ${log.visitor_id}`;
                  const isCurrentlyInside = !log.exit_time && !!log.entry_time; // Check if this specific log indicates 'inside'

                  return (
                    <TableRow
                      key={log.id}
                      className="border-b hover:bg-gray-50"
                    >
                      {/* <TableCell>{log.id}</TableCell> */}
                      <TableCell>{visitorName}</TableCell>
                      <TableCell>{formatDateTime(log.entry_time)}</TableCell>
                      <TableCell>{formatDateTime(log.exit_time)}</TableCell>
                      <TableCell>
                        {isCurrentlyInside ? (
                          <span className="font-semibold text-green-600">
                            Currently Inside
                          </span>
                        ) : log.exit_time ? (
                          <span className="text-red-600">Exited</span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* --- Form Actions --- */}
        <div className="flex space-x-4 mt-8">
          {/* Only show the general 'Update Status' button for one-time visitors */}
          {scheduleData.visitor_type === "one-time" && (
            <Button
              type="button" // Changed from submit
              onClick={handleUpdateStatus} // Call handler on click
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              Update One-Time Status
            </Button>
          )}
          <Button
            type="button"
            onClick={() => router.back()} // Go back instead of fixed URL
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </form>{" "}
      {/* End form */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
