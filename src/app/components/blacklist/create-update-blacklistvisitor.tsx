"use client";

// Import necessary React hooks and dependencies
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import UI components for the form
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/app/components/loading";
import {ExtendedVisitor} from "@/app/types/interfaces";
// Import API function to blacklist a visitor
import { BlacklistVisitorAPI } from "@/lib/serverActions/blacklist/create-update/route";

// Define schema using Zod for form validation; requires a non-empty "reason"
const formSchema = z.object({
  reason: z.string().min(1),
});

// The main BlacklistVisitor component which accepts visitorData and type as props
export default function BlacklistVisitor({ visitorData, type } : any) {
  // Log the incoming visitor data for debugging purposes
  console.log("Visitor datas:", visitorData);

  // Set up Next.js router instance for navigation
  const router = useRouter();

  // Local state to track loading status during API submission
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the react-hook-form with Zod resolver and default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Set default reason value from visitorData, if available
      reason: visitorData.reason || "",
    },
  });

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Set loading state true when submission starts
      setIsLoading(true);
      let submissionData = {};

      // Set submission payload based on the provided type prop
      if (type === "true") {
        submissionData = {
          ...values, // Spread the form values
          id: 0, // New record ID set to 0
          // Get resident_id from visitors_schedule if available, defaulting to 0
          resident_id: visitorData.visitors_schedule?.resident_id ?? 0,
          // Get security_id from the first visitor_entry_logs record if exists, defaulting to 0
          security_id: visitorData.visitor_entry_logs?.[0]?.security_id ?? 0,
          type: type, // Pass the type value
          visitor_id: visitorData.id, // Use visitorData id
          status: "Banned", // Set status as "Banned"
        };
      } else if (type === "false") {
        submissionData = {
          ...values, // Spread the form values
          id: visitorData.id, // Use visitorData id for update
          // Get resident_id from visitorData or default to 0
          resident_id: visitorData.resident_id ?? 0,
          // Get security_id from visitorData or default to 0
          security_id: visitorData.security_id ?? 0,
          type: type, // Pass the type value
          // Use the nested visitor id from visitorData.visitiors
          visitor_id: visitorData.visitiors.id,
          status: "Banned", // Set status as "Banned"
        };
      }

      // Call the API to blacklist the visitor using the constructed submissionData
      const response = await BlacklistVisitorAPI(submissionData);

      // Handle error responses based on API response codes
      if (response.code === 400) {
        toast.error("Error: Missing required fields");
        console.log(response.message);
        return;
      } else if (response.code === 500) {
        toast.error("Error: Server error");
        return;
      } else if (response.code === 200) {
        // On successful API call, show success message and navigate to the list page
        toast.success("Visitor blacklisted successfully");
        router.push("/blacklist/listblacklistvisitor");
      }
    } catch (error) {
      // In case of any unexpected error during submission
      toast.error("Error blacklisting visitor");
      console.error(error);
    } finally {
      // Reset loading state after the API call or error handling
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* If loading, display the Loading component */}
      {isLoading ? (
        <Loading />
      ) : (
        // Main container for the blacklist visitor form and read-only info
        <div className="max-w-2xl mx-auto py-12 px-6 sm:px-8 space-y-8">
          {/* Header section */}
          <h1 className="text-2xl font-semibold text-gray-800">
            Blacklist Visitor
          </h1>

          {/* Read-only visitor information display */}
          <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_first_name
                  : visitorData.visitiors?.visitor_first_name}
              </p>
            </div>
            {/* Last Name */}
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_last_name
                  : visitorData.visitiors?.visitor_last_name}
              </p>
            </div>
            {/* ID Type */}
            <div>
              <p className="text-sm text-muted-foreground">ID Type</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_id_type
                  : visitorData.visitiors?.visitor_id_type}
              </p>
            </div>
            {/* ID Number */}
            <div>
              <p className="text-sm text-muted-foreground">ID Number</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_id_number
                  : visitorData.visitiors?.visitor_id_number}
              </p>
            </div>
            {/* Status */}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-medium text-gray-900">Banned</p>
            </div>
          </div>

          {/* Form section wrapped with the Form component */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-white shadow-md border border-gray-200 rounded-2xl p-6 space-y-6"
            >
              {/* Form field for the reason input */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Reason for blacklisting"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a reason for blacklisting this visitor.
                    </FormDescription>
                    {/* Display any validation error messages */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit and Cancel buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" className="px-6">
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  // On cancel, navigate based on the type prop to the appropriate page
                  onClick={() =>
                    type === "true"
                      ? router.push("/blacklist/selectvisitor")
                      : router.push("/blacklist/listblacklistvisitor")
                  }
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      {/* Toast notification container for displaying success/error messages */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
