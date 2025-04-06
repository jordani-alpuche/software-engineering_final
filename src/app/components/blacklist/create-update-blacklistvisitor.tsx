"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { BlacklistVisitorAPI } from "@/app/api/blacklist/create-update/route";
const formSchema = z.object({
  reason: z.string().min(1),
});

export default function BlacklistVisitor({ visitorData, type }) {
  console.log("Visitor data:", visitorData); // Log the visitor data received as a prop
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: visitorData.reason || "", // use visitorData.reason if available, else empty string
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      let submissionData = {};

      if (type === "true") {
        submissionData = {
          ...values,
          id: 0,
          resident_id: visitorData.visitors_schedule?.resident_id ?? 0,
          security_id: visitorData.visitor_entry_logs?.[0]?.security_id ?? 0,
          type: type,
          visitor_id: visitorData.id,
          status: "Banned",
        };
      } else if (type === "false") {
        submissionData = {
          ...values,
          id: visitorData.id,
          resident_id: visitorData.resident_id ?? 0,
          security_id: visitorData.security_id ?? 0,
          type: type,
          visitor_id: visitorData.visitiors.id,
          status: "Banned",
        };
      }

      const response = await BlacklistVisitorAPI(submissionData);

      if (response.code === 400) {
        toast.error("Error: Missing required fields");
        console.log(response.message);
        return;
      } else if (response.code === 500) {
        toast.error("Error: Server error");
        return;
      } else if (response.code === 200) {
        toast.success("Visitor blacklisted successfully");
        router.push("/blacklist/listblacklistvisitor");
      }
    } catch (error) {
      toast.error("Error blacklisting visitor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="max-w-2xl mx-auto py-12 px-6 sm:px-8 space-y-8">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-gray-800">
            Blacklist Visitor
          </h1>

          {/* Read-only Info */}
          <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_first_name
                  : visitorData.visitiors?.visitor_first_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_last_name
                  : visitorData.visitiors?.visitor_last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID Type</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_id_type
                  : visitorData.visitiors?.visitor_id_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID Number</p>
              <p className="text-lg font-medium text-gray-900">
                {type === "true"
                  ? visitorData.visitor_id_number
                  : visitorData.visitiors?.visitor_id_number}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-medium text-gray-900">Banned</p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-white shadow-md border border-gray-200 rounded-2xl p-6 space-y-6"
            >
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" className="px-6">
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
