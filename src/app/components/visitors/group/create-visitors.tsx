"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { useRouter } from "next/navigation";
import { createGroupVisitor } from "@/lib/serverActions/visitors/create/CreateVisitorActions";
import Loading from "@/app/components/loading"; // Import your loading component
import { set } from "date-fns";
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
  resident_id: z.coerce.number(),
  visitor_phone: z.string().min(1),
  visitor_email: z.string().min(1),
  status: z.string().min(1),
  visitor_type: z.string(),
  type: z.boolean().optional(),
  license_plate: z.string().min(1),
  visitor_entry_date: z.coerce.date(),
  visitor_exit_date: z.coerce.date(),
  comments: z.string().optional(),
  sg_type: z.coerce.number(),

  visitors: z.array(
    z.object({
      visitor_first_name: z
        .string()
        .min(1, { message: "First name is required" }),
      visitor_last_name: z
        .string()
        .min(1, { message: "Last name is required" }),
      visitor_id_type: z.string().min(1, { message: "ID type is required" }),
      visitor_id_number: z
        .string()
        .min(1, { message: "ID number is required" }),
    })
  ),
});

export default function CreateVisitors({ userID: userid }:any) {
   const hasMounted = useHasMounted();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resident_id: userid,
      visitor_phone: "",
      visitor_email: "",
      status: "",
      visitor_type: "",
      type: false,
      license_plate: "",
      visitor_entry_date: new Date(),
      visitor_exit_date: new Date(),
      comments: "",
      sg_type: 0,
      visitors: [],
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
    // console.log("submitted values", values);
    const formattedData = { ...values };

    if (formattedData.visitors.length === 0) {
      toast.error("At least one visitor is required.");
      return;
    }
    formattedData.sg_type = 1;
    

    if (formattedData.type === true) {
      formattedData.visitor_type = "recurring";
    } else {
      formattedData.visitor_type = "one-time";
    }

    setIsLoading(true);
    try {
      // Assuming `createGroupVisitor` is the API function to create a group visitor
      const response = await createGroupVisitor(formattedData);

      if (response.code === 200) {
        toast.success("Visitor group created successfully!");
        router.push("/visitors/listvisitors"); // Redirect to visitor list
      } else if (response.code === 400) {
        toast.error(
          "Failed to create visitor group: Ensure all Fields are filled"
        );
      } else if (response.code === 403) {
        toast.error("Visitor is blacklisted");
      } else {
        const errorData = await response;
        // console.log("Error creating visitor group:", errorData);
        toast.error(errorData.message || "Failed to create visitor group");
      }
    } catch (error) {
      toast.error("An error occurred while creating the visitor group.");
    } finally {
      setIsLoading(false);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "visitors",
  });

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
                          className={cn("resize-none")}
                          placeholder="Email Address"
                          type="email"
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
            <Separator />

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border p-4 rounded-lg space-y-3 relative"
              >
                <h3 className="font-bold text-lg">Visitor {index + 1}</h3>
                <Button
                  type="button"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  Delete
                </Button>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`visitors.${index}.visitor_first_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`visitors.${index}.visitor_last_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
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
                      name={`visitors.${index}.visitor_id_type`}
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
                              <SelectItem value="ss">
                                Social Security
                              </SelectItem>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="driver_license">
                                Driver License
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select Vistor ID Type
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`visitors.${index}.visitor_id_number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input placeholder="ID Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => {
                if (fields.length < 8) {
                  append({
                    visitor_first_name: "",
                    visitor_last_name: "",
                    visitor_id_type: "",
                    visitor_id_number: "",
                  });
                } else {
                  toast.error("You can only add up to 8 visitors.");
                }
              }}
              disabled={fields.length >= 8}
            >
              Add Visitor
            </Button>
            <Separator />

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
