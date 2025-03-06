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
import { set } from "date-fns";

const formSchema = z
  .object({
    username: z.string().min(1, "Username is required."),
    password: z.string().min(1, "Password is required."),
    role: z.string().min(1, "Role is required."),
    status: z.string().min(1, "Status is required."),
    resident_first_name: z.string().optional(),
    resident_last_name: z.string().optional(),
    resident_email: z.string().optional(),
    resident_phone_number: z.string().optional(),
    resident_address: z.string().optional(),
    resident_house_number: z.string().optional(),
    security_first_name: z.string().optional(),
    security_last_name: z.string().optional(),
    security_email: z.string().optional(),
    security_phone_number: z.string().optional(),
    security_address: z.string().optional(),
    security_access_point: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z.number().optional()
    ),
    security_shift: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "resident") {
        return (
          data.resident_first_name &&
          data.resident_last_name &&
          data.resident_email &&
          data.resident_phone_number &&
          data.resident_house_number &&
          data.resident_address
        );
      }
      return true;
    },
    {
      message: "Resident fields are required when role is 'Resident'.",
      path: ["role"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "security") {
        return (
          data.security_first_name &&
          data.security_last_name &&
          data.security_email &&
          data.security_phone_number &&
          data.security_address &&
          data.security_shift &&
          data.security_access_point
        );
      }
      return true;
    },
    {
      message: "Security fields are required when role is 'Security'.",
      path: ["role"],
    }
  );

export default function UpdateUsers() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [storedPasswordHash, setStoredPasswordHash] = useState<string>("");
  const [isLoadingAccessPoints, setIsLoadingAccessPoints] = useState(true);
  const [accessPoints, setAccessPoints] = useState<
    { id: number; name: string }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "",
      status: "",
      resident_first_name: "",
      resident_last_name: "",
      resident_email: "",
      resident_address: "",
      resident_phone_number: "",
      resident_house_number: "",
      security_first_name: "",
      security_last_name: "",
      security_email: "",
      security_phone_number: "",
      security_address: "",
      security_shift: "",
      security_access_point: 0,
    },
  });

  // const role = form.watch("role");

  // Fetch user data
  useEffect(() => {
    if (!userId) return;

    async function fetchUser() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const userData = await response.json();
        setRole(userData.role);

        // setStoredPasswordHash(userData.password || "");
        form.reset({
          username: userData.username,
          password: "",
          role: userData.role,
          status: userData.status,
        });
      } catch (error) {
        toast.error("Error fetching user data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [userId, form]);

  /// Fetch access points
  useEffect(() => {
    async function fetchAccessPoints() {
      try {
        setIsLoadingAccessPoints(true);
        const response = await fetch("/api/accesspoint/list");
        if (!response.ok) throw new Error("Failed to fetch access points");

        const data = await response.json();
        setAccessPoints(data);
      } catch (error) {
        toast.error("Error fetching access points");
      } finally {
        setIsLoadingAccessPoints(false);
      }
    }

    fetchAccessPoints();
  }, []);

  // Fetch role-specific data
  useEffect(() => {
    if (!userId) return;

    async function fetchRoleData() {
      try {
        setIsLoading(true);
        if (role === "resident") {
          const response = await fetch(`/api/resident/${userId}`);
          if (!response.ok) throw new Error("Resident not found");

          const residentData = await response.json();
          form.reset({
            resident_first_name: residentData.resident_first_name,
            resident_last_name: residentData.resident_last_name,
            resident_email: residentData.resident_email,
            resident_phone_number: residentData.resident_phone_number,
            resident_address: residentData.resident_address,
            resident_house_number: residentData.resident_house_number,
          });
        } else if (role === "security") {
          const response = await fetch(`/api/security/${userId}`);
          if (!response.ok) throw new Error("Security not found");

          const securityData = await response.json();
          form.reset({
            security_first_name: securityData.security_first_name,
            security_last_name: securityData.security_last_name,
            security_email: securityData.security_email,
            security_phone_number: securityData.security_phone_number,
            security_address: securityData.security_address,
            security_access_point: securityData.security_access_point,
            security_shift: securityData.security_shift,
          });
        }
      } catch (error) {
        toast.error(`Error fetching data`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoleData();
  }, [userId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError("");

    const userData = { ...values };

    setTimeout(async () => {
      // If the password field is empty, use the existing password hash
      if (!values.password && storedPasswordHash) {
        userData.password = storedPasswordHash;
      }

      console.log(userData);

      const endpoint = `/api/users/${userId}`;
      const method = "PUT";

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error || "An unknown error occurred");
          toast.error(result.error || "An unknown error occurred");
        } else {
          toast.success(
            userId ? "User updated successfully" : "User created successfully"
          );
          // console.log(response);
          router.push("/users/listusers");
        }
      } catch (error) {
        setError("An error occurred while saving the user");
        toast.error("An error occurred while saving the user");
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate a delay to show the loading state
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
            {role === "resident" && (
              <div className="border p-4 mt-4 rounded-md">
                <h2 className="text-lg font-semibold">Resident Information</h2>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="resident_first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident First Name</FormLabel>
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
                      name="resident_last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Resident Last Name</FormDescription>
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
                      name="resident_phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Phone Number"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Resident Phone Number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="resident_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Email Address"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Resident Email Address
                          </FormDescription>
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
                      name="resident_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Address"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Resident Address</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="resident_house_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident House Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House Number"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Resident House Number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="Resident_error_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label {...field}></label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/*Security Guard information*/}
            {role === "security" && (
              <div className="border p-4 mt-4 rounded-md">
                <h2 className="text-lg font-semibold">
                  Security Guard Information
                </h2>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="security_first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Security First Name"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Security First Name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="security_last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Security Last Name"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Security Last Name
                          </FormDescription>
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
                      name="security_phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Security Phone Number"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Security Phone Number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="security_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Security Email"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Security Email
                          </FormDescription>
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
                      name="security_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Security Address"
                              type="text"
                              {...field}
                              className="px-4 py-2"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter Security Address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormField
                      control={form.control}
                      name="security_access_point"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Point</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value ? Number(field.value) : ""} // Ensure controlled value
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an access point" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingAccessPoints ? (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                accessPoints.map((point) => (
                                  <SelectItem key={point.id} value={point.id}>
                                    {point.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select an access point
                          </FormDescription>
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
                      name="security_shift"
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
                              <SelectItem value="afternoon">
                                Afternoon
                              </SelectItem>
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
                <FormField
                  control={form.control}
                  name="Security_error_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label {...field}></label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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
