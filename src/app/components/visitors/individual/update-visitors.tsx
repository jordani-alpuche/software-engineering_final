"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { useRouter } from "next/navigation";
import { updateIndividualSchedule } from "@/app/api/visitors/[id]/route";
import Loading from "@/app/components/loading"; // Import your loading component
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  resident_id: z.number(),
  visitor_first_name: z.string().min(1),
  visitor_phone: z.string().min(1),
  visitor_id_type: z.string().min(1),
  visitor_id_number: z.string().min(1),
  visitor_email: z.string().min(1),
  status: z.string().min(1),
  visitor_type: z.unknown(),
  visitor_last_name: z.string().min(1),
  license_plate: z.string().min(1),
  visitor_entry_date: z.coerce.date(),
  visitor_exit_date: z.coerce.date(),
  comments: z.string().optional(),
});

export default function UpdateVisitors({ scheduleData, scheduleID }) {
  // console.log("scheduleData", scheduleData.visitiors[0].visitor_first_name);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const data = { ...scheduleData };

  if (data.visitor_type === "recurring") {
    data.visitor_type = true;
  } else {
    data.visitor_type = false;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resident_id: data.resident_id,
      visitor_first_name: data.visitiors[0].visitor_first_name,
      visitor_phone: data.visitor_phone,
      visitor_id_type: data.visitiors[0].visitor_id_type,
      visitor_id_number: data.visitiors[0].visitor_id_number,
      visitor_email: data.visitor_email,
      status: data.status,
      visitor_type: data.visitor_type,
      visitor_last_name: data.visitiors[0].visitor_last_name,
      license_plate: data.license_plate,
      visitor_entry_date: data.visitor_entry_date,
      visitor_exit_date: data.visitor_exit_date,
      comments: data?.comments,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const formattedData = { ...values };

    // console.log("Form Data:", values);

    if (formattedData.visitor_type === true) {
      formattedData.visitor_type = "recurring";
    } else {
      formattedData.visitor_type = "one-time";
    }

    try {
      const updateVisitorResponse = await updateIndividualSchedule(
        scheduleID,
        formattedData
      );
      // console.log("Response:", updateVisitorResponse);

      if (updateVisitorResponse.code === 400) {
        toast.error("Please fill all the required fields");
        console.log("Error:", updateVisitorResponse);
        setIsLoading(false);
      } else if (updateVisitorResponse.code === 500) {
        toast.error("An Error Occurred while submitting the form.");
        console.log("Error:", updateVisitorResponse);
        setIsLoading(false);
      } else if (updateVisitorResponse.code === 200) {
        toast.success("Schedule Updated successfully!");
        router.push("/visitors/listvisitors");
      }
    } catch (error) {
      setIsLoading(false);
      // console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto py-10 px-4 sm:px-6 md:px-8"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Visitor First Name"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter Visitor First Name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" type="text" {...field} />
                      </FormControl>
                      <FormDescription>Enter Visitor Last Name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Visitor Phone Number"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter Visitor Phone Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email Address"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter Visitor Email Address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_id_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vistor ID type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ID Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ss">Social Security</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="driver_license">
                            Driver License
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select Vistor ID Type</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_id_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor ID Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ID Number" type="text" {...field} />
                      </FormControl>
                      <FormDescription>Enter Visitor ID Number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="license_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor License Plate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Visitor License Plate"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter Visitor License Plate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_type"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Recurring Visitor</FormLabel>
                        <FormDescription>Recurring</FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_entry_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Entry Date Time</FormLabel>
                      <DateTimePicker
                        {...field}
                        format={[
                          ["months", "days", "years"],
                          ["hours", "minutes", "am/pm"],
                        ]}
                        onChange={(date) => {
                          field.onChange(date); // Ensure form state updates
                          console.log("Selected date:", date?.toString());
                        }}
                      />
                      <FormDescription>
                        Enter Visit Day and Time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="visitor_exit_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Exit Date Time</FormLabel>
                      <DateTimePicker
                        {...field}
                        format={[
                          ["months", "days", "years"],
                          ["hours", "minutes", "am/pm"],
                        ]}
                      />
                      <FormDescription>Enter Exit Date Time</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Comments"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter Comments</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Status of Visitor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Submit</Button>
            <Button
              onClick={() => {
                router.push("/visitors/listvisitors");
              }}
              type="button"
            >
              Cancel
            </Button>
          </form>
        </Form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
