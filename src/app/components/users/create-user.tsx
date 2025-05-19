"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import the ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the toast styles
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
// import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/loading"; // Import your loading component
import { useSession } from "next-auth/react"; // Import useSession
import { createUser } from "@/lib/serverActions/users/create/CreateUserActions";
import { create } from "domain";

const formSchema = z
  .object({
    // User fields
    username: z.string().min(1, "Username is required."),
    password: z.string().min(1, "Password is required."),
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
    //error messages
    // error_message: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "security") {
        return data.shift && data.accesspoints;
      }
      return true; // No validation if role is not "security"
    },
    {
      message: "Security fields are required when role is 'Security'.",
      path: ["error_message"],
    }
  );
export default function MyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(""); // New state to track the role selection
  const { data: session } = useSession(); // Access session data (including JWT)
  const [accessPoints, setAccessPoints] = useState<
    { id: number; name: string }[]
  >([]);
  const [isLoadingAccessPoints, setIsLoadingAccessPoints] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "",
      status: "",
      first_name: "",
      last_name: "",
      email: "",
      address: "",
      phone_number: "",
      house_number: "",
      shift: "",
      accesspoints: "",
      //set default values for the error messages
      // error_message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Show loading spinner
    setError("");

    const userData = { ...values }; // Spread operator to create a new object with the form values

    try {
      const createUserReturn = await createUser(userData); // Call the API to create the user
      // console.log("return", createUserReturn);
      if (createUserReturn?.success === false) {
        // Check if the API call was unsuccessful
        if (createUserReturn?.message === "taken") {
          // Check if the error message indicates a taken username
          setError(
            createUserReturn?.message ||
              "Username is already taken. Please choose another."
          ); // Set the error message in the state
          toast.error("Username is already taken. Please choose another."); // Show error toast notification
        } else {
          setError(createUserReturn?.message || "An unknown error occurred"); // Set the error message in the state
          toast.error(createUserReturn?.message || "An unknown error occurred"); // Show error toast notification
        }
      } else {
        toast.success("User created successfully"); // Show success toast notification
        router.push("/users/listusers"); // Redirect to the list users page
      }
    } catch (error) {
      setError("An error occurred while creating the user"); // Set the error message in the state
      toast.error("An error occurred while creating the user"); // Show error toast notification
    } finally {
      setIsLoading(false); // Hide loading spinner after 1 second
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Form {...form}>
          {" "}
          {/* Form component from your UI library  and spread the form components */}
          <form
            onSubmit={form.handleSubmit(onSubmit)} // Handle form submission
            className="space-y-8 max-w-3xl mx-auto py-10 px-4"
          >
            {/* User Information Section */}

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
                          className="px-4 py-2"
                        />
                      </FormControl>
                      <FormDescription>Enter your Username</FormDescription>
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
                          placeholder="Password"
                          {...field}
                          className="px-4 py-2" // Add padding inside the input field
                        />
                      </FormControl>
                      <FormDescription>Enter your password.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role Dropdown */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setRole(value); // Update role state
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Role" />
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
                      <FormDescription>Role of User</FormDescription>
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
                      <FormDescription>Status of User</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                              type="email"
                              {...field}
                              className="px-4 py-2"
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

            {/*Security Guard information*/}
            {role === "security" && (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="accesspoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Point</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Access Point" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left-wing">Left Wing</SelectItem>
                            <SelectItem value="right-wing">
                              Right Wing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Access Points</FormDescription>
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
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
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
            {/* <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6">
                <FormField
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
                />
              </div>
            </div> */}

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="mt-4">
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
