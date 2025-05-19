"use client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
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
import Loading from "@/app/components/loading";
import { updateUser } from "@/lib/serverActions/users/update/UpdateUsersActions";

const formSchema = z
  .object({
    username: z.string().min(1, "Username is required."),
    password: z.string().optional(),
    role: z.string().min(1, "Role is required."),
    status: z.string().min(1, "Status is required."),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    house_number: z.string().optional(),

    accesspoints: z.string().optional(),
    shift: z.string().optional(),
  })

  .refine(
    (data) => {
      if (data.role === "security") {
        return data.shift && data.accesspoints;
      }
      return true;
    },
    {
      message: "Security fields are required when role is 'Security'.",
      path: ["role"],
    }
  );

export default function UpdateUsers({ userData }:any) {
  // let form = {};
  const router = useRouter();
  const params = useParams();
  const userId = Number(params?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [role, setRole] = useState<string>(userData.role);
  const [storedPasswordHash, setStoredPasswordHash] = useState<string>("");
  // const [isLoadingAccessPoints, setIsLoadingAccessPoints] = useState(false);
  const [accessPoints, setAccessPoints] = useState<
    { id: number; name: string }[]
  >([]);

  // try {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: userData?.username || "",
      password: "",
      role: userData?.role || "",
      status: userData?.status || "",
      first_name: userData?.first_name || "",
      last_name: userData?.last_name || "",
      email: userData?.email || "",
      address: userData?.address || "",
      phone_number: userData?.phone_number || "",
      house_number: userData?.house_number || "",
      shift: userData?.shift || "",
      accesspoints: userData?.accesspoints || "",
    },
  });
  // } catch (error) {
  //   console.error("Error:", error);
  // } finally {
  // setIsLoading(false);
  // }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    {
      setIsLoading(true);
      setError("");
      const rest = { ...values };
      let residentReturn = {};
      let securityReturn = {};
      const role = rest.role;
      console.log("role", role);

      const userData = { ...values };

      try {
        // Always update user data
        const updater = await updateUser(userId, userData);

        toast.success("User updated successfully");
        router.push("/users/listusers"); // Redirect after successful update
      } catch (error) {
        setError("An error occurred while saving the user");
        toast.error("An error occurred while saving the user");
      } finally {
        setIsLoading(false);
      }
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
            className="space-y-8 max-w-3xl mx-auto py-10 px-4"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Username"
                          type="text"
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep existing password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setRole(value); // Update role state
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="security">
                            Security Guard
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          {/* <SelectItem value="security">Security Guard</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Conditional Rendering Based on Role */}
            {(role === "resident" || role === "security") && (
              <div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your First Name.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Last Name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Phone Number"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Phone Number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Email Address"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Email Address</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Address"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Address</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="house_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>House Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House Number"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>House Number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "security" && (
              // <div className="border p-4 mt-4 rounded-md">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="accesspoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Point</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Access point" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left-wing">Left Wing</SelectItem>
                            <SelectItem value="right-wing">
                              Right Wing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Security Shift</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Shift</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Security Shift" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="night">Night</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Security Shift</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            {/* <FormField
                  control={form.control}
                  name="error_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label {...field}></label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
            {/* </div> */}

            <Button type="submit">Update</Button>
            <Button
              type="button"
              onClick={() => router.push("/users/listusers")}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Cancel"}
            </Button>
          </form>
        </Form>
      )}

      {/* Toast container to show toasts */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
