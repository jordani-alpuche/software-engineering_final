"use client";
import { useState } from "react";
import { toast } from "sonner"; // For displaying toast notifications
import { useForm } from "react-hook-form"; // Hook for form handling
import { zodResolver } from "@hookform/resolvers/zod"; // For Zod validation integration with React Hook Form
import * as z from "zod"; // Zod schema validation library
import { Button } from "@/components/ui/button"; // Button component
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // UI components for the form structure
import { Rating } from "@/components/ui/rating"; // Rating component
import { Textarea } from "@/components/ui/textarea"; // Textarea component
import { createVisitorFeedback } from "@/app/api/feedback/create/route"; // API call for submitting feedback

// Define the validation schema for the form using Zod
const formSchema = z.object({
  rating: z.number(), // Rating must be a number
  comments: z.string(), // Comments must be a string
});

export default function CreateFeedback({ scheduleData }) {
  // Initialize the form using react-hook-form with Zod resolver for validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // On form submission, this function will be called
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Extract scheduleId from the passed scheduleData and prepare the form data
      const scheduleId = scheduleData.id;
      const formData = { ...values, scheduleId }; // Combine form values with scheduleId
      console.log("formData", formData); // Log the form data for debugging

      // Send the form data to the API to create feedback
      const response = await createVisitorFeedback(formData);
      console.log("response", response); // Log the API response for debugging

      // Show a success or error toast based on the response code
      if (response.code === 200) {
        toast.success("Feedback submitted successfully!"); // Success toast
      } else {
        toast.error(response.message || "Failed to submit feedback."); // Error toast
      }
    } catch (error) {
      // Catch any errors that occur during form submission
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again."); // Error toast
    }
  };

  return (
    // Wrap the form in the Form component for easy state management
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)} // Handle form submission
        className="space-y-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="space-y-6 bg-white dark:bg-muted rounded-xl shadow-sm p-6 border">
          {/* Rating Field */}
          <FormField
            control={form.control}
            name="rating" // The name of the field that will hold the rating
            render={({ field }) => (
              <FormItem className="flex flex-col items-center gap-2 text-center">
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <Rating {...field} />{" "}
                    {/* Render the Rating component with the field values */}
                  </div>
                </FormControl>
                <FormDescription>Please provide your rating.</FormDescription>
                <FormMessage /> {/* Show form validation messages */}
              </FormItem>
            )}
          />

          {/* Comments Field */}
          <FormField
            control={form.control}
            name="comments" // The name of the field that will hold the comments
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Comment on your experience..."
                    className="resize-none min-h-[100px]" // Apply some styling to the textarea
                    {...field} // Pass field props to the Textarea component
                  />
                </FormControl>
                <FormDescription>
                  Please comment on your experience.
                </FormDescription>
                <FormMessage /> {/* Show form validation messages */}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div>
            <Button type="submit" className="w-full sm:w-auto">
              Submit {/* Button text */}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
