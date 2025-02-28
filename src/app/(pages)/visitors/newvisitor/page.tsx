"use client";
import { useState } from "react";
import { toast } from "sonner";
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

const formSchema = z.object({
  visitor_name: z.string().min(1),
  visitor_phone: z.string().min(1),
  visitor_id_type: z.string(),
  visitor_id_number: z.string().min(1),
  visitor_email: z.string(),
  type: z.unknown(),
  visit_date_start: z.coerce.date(),
  visit_date_end: z.coerce.date(),
  status: z.string(),
});

export default function MyForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visit_date_start: new Date(),
      visit_date_end: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10 px-4 sm:px-6 md:px-8"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="visitor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visitor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Visitor Name" type="text" {...field} />
                  </FormControl>
                  <FormDescription>Enter Visitor Name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="visitor_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visitor Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" type="text" {...field} />
                  </FormControl>
                  <FormDescription>Enter Visitor Phone Number</FormDescription>
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
                      <SelectItem value="m@example.com">
                        m@example.com
                      </SelectItem>
                      <SelectItem value="m@google.com">m@google.com</SelectItem>
                      <SelectItem value="m@support.com">
                        m@support.com
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
              name="visitor_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visitor Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Visitor Email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter Visitor Email</FormDescription>
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
              name="visit_date_start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Entry Date Time</FormLabel>
                  <DateTimePicker
                    {...field}
                    format={[
                      ["months", "days", "years"],
                      ["hours", "minutes", "am/pm"],
                    ]}
                  />
                  <FormDescription>Enter Visit Day and Time</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="visit_date_end"
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="m@example.com">m@example.com</SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Status of Visitor</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
  );
}
