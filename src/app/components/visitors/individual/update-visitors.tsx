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
import { useRouter } from "next/navigation";
import { updateIndividualSchedule } from "@/lib/serverActions/visitors/update/UpdateVisitorActions";
import Loading from "@/app/components/loading"; // Import your loading component
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import {useHasMounted} from "@/hooks/useHasMounted";

const formSchema = z.object({
  resident_id: z.number(),
  visitor_first_name: z.string().min(1),
  visitor_phone: z.string().min(1),
  visitor_id_type: z.string().min(1),
  visitor_id_number: z.string().min(1),
  visitor_email: z.string().min(1),
  status: z.string().min(1),
  visitor_type: z.string().optional(),
  type: z.boolean().optional(),
  visitor_last_name: z.string().min(1),
  license_plate: z.string().min(1),
  visitor_entry_date: z.coerce.date(),
  visitor_exit_date: z.coerce.date(),
  comments: z.string().optional(),
});

export default function UpdateVisitors({ scheduleData, scheduleID }:any) {
  // console.log("scheduleData", scheduleData.visitiors[0].visitor_first_name);
  const hasMounted = useHasMounted();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const data = { ...scheduleData };

  if (data.visitor_type === "recurring") {
    data.type = true;
  } else {
    data.type = false;
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
      type: data.type,
      visitor_type: data.visitor_type,
      visitor_last_name: data.visitiors[0].visitor_last_name,
      license_plate: data.license_plate,
      visitor_entry_date: data.visitor_entry_date,
      visitor_exit_date: data.visitor_exit_date,
      comments: data?.comments,
    },
  });

  function handleDateSelect(date: Date | undefined, fieldName: "visitor_entry_date" | "visitor_exit_date" | undefined) {
    if (date && fieldName) {
      form.setValue(fieldName, date);
    }
  }
 
  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string, fieldName:"visitor_entry_date"|"visitor_exit_date") {
    const currentDate = form.getValues(fieldName) || new Date();
    let newDate = new Date(currentDate);
 
    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }
 
    form.setValue(fieldName, newDate);
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log("Form Values:", values);
    setIsLoading(true);
    const formattedData = { ...values };    

    if (formattedData.type === true) {
      formattedData.visitor_type = "recurring";
    } else {
      formattedData.visitor_type = "one-time";
    }

    // console.log("Form Data:", formattedData);

    try {
      const updateVisitorResponse = await updateIndividualSchedule(
        scheduleID,
        formattedData
      );
      // console.log("Response:", updateVisitorResponse);

      if (updateVisitorResponse.code === 400) {
        toast.error("Please fill all the required fields");
        // console.log("Error:", updateVisitorResponse);
        setIsLoading(false);
      } else if (updateVisitorResponse.code === 500) {
        toast.error("An Error Occurred while submitting the form.");
        // console.log("Error:", updateVisitorResponse);
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
                  name="type"
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
                      <FormLabel>Enter your date & time (12h)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                                {hasMounted && field.value
                                ? format(field.value, "PPP p")
                                : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="sm:flex">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => handleDateSelect(date, "visitor_entry_date")}
                              initialFocus
                                                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const maxDate = new Date();
                                maxDate.setMonth(maxDate.getMonth() + 3);
                                maxDate.setHours(23, 59, 59, 999); // optional, to include the full day

                                return date < today || date > maxDate;
                              }}
                            />
                            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                              <ScrollArea className="w-64 sm:w-auto">
                                <div className="flex sm:flex-col p-2">
                                  {Array.from({ length: 12 }, (_, i) => i + 1)
                                    .reverse()
                                    .map((hour) => (
                                      <Button
                                        key={hour}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          field.value.getHours() % 12 === hour % 12
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                          handleTimeChange("hour", hour.toString(),"visitor_entry_date")
                                        }
                                      >
                                        {hour}
                                      </Button>
                                    ))}
                                </div>
                                <ScrollBar
                                  orientation="horizontal"
                                  className="sm:hidden"
                                />
                              </ScrollArea>
                              <ScrollArea className="w-64 sm:w-auto">
                                <div className="flex sm:flex-col p-2">
                                  {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                    (minute) => (
                                      <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          field.value.getMinutes() === minute
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                          handleTimeChange("minute", minute.toString(),"visitor_entry_date")
                                        }
                                      >
                                        {minute.toString().padStart(2, "0")}
                                      </Button>
                                    )
                                  )}
                                </div>
                                <ScrollBar
                                  orientation="horizontal"
                                  className="sm:hidden"
                                />
                              </ScrollArea>
                              <ScrollArea className="">
                                <div className="flex sm:flex-col p-2">
                                  {["AM", "PM"].map((ampm) => (
                                    <Button
                                      key={ampm}
                                      size="icon"
                                      variant={
                                        field.value &&
                                        ((ampm === "AM" &&
                                          field.value.getHours() < 12) ||
                                          (ampm === "PM" &&
                                            field.value.getHours() >= 12))
                                          ? "default"
                                          : "ghost"
                                      }
                                      className="sm:w-full shrink-0 aspect-square"
                                      onClick={() => handleTimeChange("ampm", ampm,"visitor_entry_date")}
                                    >
                                      {ampm}
                                    </Button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Please select your preferred date and time.
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
                      <FormLabel>Enter your date & time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                                {hasMounted && field.value
                                  ? format(field.value, "PPP p")
                                  : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="sm:flex">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => handleDateSelect(date, "visitor_exit_date")}
                              initialFocus
                                                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const maxDate = new Date();
                                maxDate.setMonth(maxDate.getMonth() + 3);
                                maxDate.setHours(23, 59, 59, 999); // optional, to include the full day

                                return date < today || date > maxDate;
                              }}
                            />
                            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                              <ScrollArea className="w-64 sm:w-auto">
                                <div className="flex sm:flex-col p-2">
                                  {Array.from({ length: 12 }, (_, i) => i + 1)
                                    .reverse()
                                    .map((hour) => (
                                      <Button
                                        key={hour}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          field.value.getHours() % 12 === hour % 12
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                          handleTimeChange("hour", hour.toString(),"visitor_exit_date")
                                        }
                                      >
                                        {hour}
                                      </Button>
                                    ))}
                                </div>
                                <ScrollBar
                                  orientation="horizontal"
                                  className="sm:hidden"
                                />
                              </ScrollArea>
                              <ScrollArea className="w-64 sm:w-auto">
                                <div className="flex sm:flex-col p-2">
                                  {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                    (minute) => (
                                      <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          field.value.getMinutes() === minute
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                          handleTimeChange("minute", minute.toString(),"visitor_exit_date")
                                        }
                                      >
                                        {minute.toString().padStart(2, "0")}
                                      </Button>
                                    )
                                  )}
                                </div>
                                <ScrollBar
                                  orientation="horizontal"
                                  className="sm:hidden"
                                />
                              </ScrollArea>
                              <ScrollArea className="">
                                <div className="flex sm:flex-col p-2">
                                  {["AM", "PM"].map((ampm) => (
                                    <Button
                                      key={ampm}
                                      size="icon"
                                      variant={
                                        field.value &&
                                        ((ampm === "AM" &&
                                          field.value.getHours() < 12) ||
                                          (ampm === "PM" &&
                                            field.value.getHours() >= 12))
                                          ? "default"
                                          : "ghost"
                                      }
                                      className="sm:w-full shrink-0 aspect-square"
                                      onClick={() => handleTimeChange("ampm", ampm,"visitor_exit_date")}
                                    >
                                      {ampm}
                                    </Button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Please select your preferred date and time.
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
