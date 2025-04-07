"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Rating } from "@/components/ui/rating";
import { Textarea } from "@/components/ui/textarea";
import { createVisitorFeedback } from "@/app/api/feedback/create/route";

const formSchema = z.object({
  rating: z.number(),
  comments: z.string(),
});

export default function CreateFeedback({ scheduleData }) {
  //   console.log("scheduleData", scheduleData.id);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // const  formData  = {...values};
      const scheduleId = scheduleData.id;
      const formData = { ...values, scheduleId };
      console.log("formData", formData);

      const response = await createVisitorFeedback(formData);
      console.log("response", response);

      if (response.code === 200) {
        toast.success("Feedback submitted successfully!");
      } else {
        toast.error(response.message || "Failed to submit feedback.");
      }
      //   console.log(formData);
      //   toast(
      //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
      //       <code className="text-white">{JSON.stringify(values, null, 2)}</code>
      //     </pre>
      //   );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="space-y-6 bg-white dark:bg-muted rounded-xl shadow-sm p-6 border">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center gap-2 text-center">
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <Rating {...field} />
                  </div>
                </FormControl>
                <FormDescription>Please provide your rating.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Comment on your experience..."
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Please comment on your experience.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button type="submit" className="w-full sm:w-auto">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
