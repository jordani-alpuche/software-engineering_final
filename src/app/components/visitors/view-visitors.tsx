"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
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
import { updateEntryExitStatus } from "@/app/api/visitors/entry-exit/route"; // Adjust the import path

export default function ViewVisitors({ scheduleData, userid }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // State to store checkbox values
  const [visitorStatuses, setVisitorStatuses] = useState(() => {
    return (
      scheduleData.visitiors?.map((visitor: any) => {
        const log = scheduleData.visitor_entry_logs?.find(
          (log: any) => log.visitor_id === visitor.id
        );

        return {
          id: visitor.id,
          entry: !!log?.entry_time, // Set `entry` to `true` if entry_time exists
          exit: !!log?.exit_time, // Set `exit` to `true` if exit_time exists
        };
      }) || []
    );
  });

  // Handle checkbox changes
  const handleCheckboxChange = (visitorId: number, status: any) => {
    setVisitorStatuses((prevStatuses: any) => {
      return prevStatuses.map((visitor: any) => {
        if (visitor.id === visitorId) {
          return {
            ...visitor,
            [status]: !visitor[status], // Toggle the checkbox state
          };
        }
        return visitor;
      });
    });
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const entryExitData = visitorStatuses.map(({ id, entry, exit }) => ({
        visitorId: id,
        entryChecked: entry,
        exitChecked: exit,
        scheduleId: scheduleData.id,
        securityId: userid,
      }));

      const response = await updateEntryExitStatus(entryExitData);

      if (response.code === 200) {
        toast.success("Entry/Exit status updated successfully!");

        // Reload the form data
        window.location.reload();
      } else {
        toast.error("Error updating status: " + response.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred: " + error.message);
    }
  };

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-8 max-w-3xl mx-auto py-10 px-4 sm:px-6 md:px-8"
        >
          <h1 className="text-3xl font-semibold">Visitor Details</h1>

          {/* Visitor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <div>
              <p>
                <strong>Phone Number:</strong> {scheduleData.visitor_phone}
              </p>
              <p>
                <strong>Email:</strong> {scheduleData.visitor_email}
              </p>
              <p>
                <strong>License Plate:</strong> {scheduleData.license_plate}
              </p>
            </div>
            <div>
              <p>
                <strong>Visitor Type:</strong> {scheduleData.visitor_type}
              </p>
              <p>
                <strong>Status:</strong> {scheduleData.status}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p>
              <strong>Estimated Entry Date:</strong>{" "}
              {new Date(scheduleData.visitor_entry_date).toString()}
            </p>
            <p>
              <strong>Estimated Exit Date:</strong>{" "}
              {new Date(scheduleData.visitor_exit_date).toString()}
            </p>
            {scheduleData.comments && (
              <p>
                <strong>Comments:</strong> {scheduleData.comments}
              </p>
            )}
          </div>

          {/* QR Code */}
          {scheduleData.visitor_qrcode && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold">QRCode</h2>
              <div className="flex justify-center mt-4">
                <QRCodeCanvas value={scheduleData.visitor_qrcode} size={200} />
              </div>
            </div>
          )}

          {/* Visitor Table with Entry/Exit Checkboxes */}
          <h2 className="text-2xl font-semibold mt-8">Visitors</h2>
          <Table className="mt-4 border">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>ID Type</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead className="text-center">Entry/Exit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData.visitiors?.map((visitor: any, index: any) => (
                <TableRow
                  key={visitor.id}
                  className="border-b hover:bg-gray-50"
                >
                  <TableCell>{visitor.visitor_first_name}</TableCell>
                  <TableCell>{visitor.visitor_last_name}</TableCell>
                  <TableCell>{visitor.visitor_id_type}</TableCell>
                  <TableCell>{visitor.visitor_id_number}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-4">
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            !!visitorStatuses.find((v) => v.id === visitor.id)
                              ?.entry
                          }
                          onChange={() =>
                            handleCheckboxChange(visitor.id, "entry")
                          }
                        />
                        Entry
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={visitorStatuses[index].exit}
                          disabled={!visitorStatuses[index].entry} // Disable exit if entry is not checked
                          onChange={() =>
                            handleCheckboxChange(visitor.id, "exit")
                          }
                        />
                        Exit
                      </label>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Form Actions */}
          <div className="flex space-x-4 mt-6">
            <Button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Update Status
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/visitors/listvisitors")}
              className="bg-gray-500 text-white px-6 py-2 rounded-md"
            >
              Back to List
            </Button>
          </div>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
