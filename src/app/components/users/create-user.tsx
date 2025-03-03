// "use client";
// import { useState } from "react";
// // import { toast } from "sonner";
// import { ToastContainer, toast } from "react-toastify"; // Import the ToastContainer
// import "react-toastify/dist/ReactToastify.css"; // Import the toast styles
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// // import { PasswordInput } from "@/components/ui/password-input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Loading from "@/app/loading"; // Import your loading component

// const formSchema = z.object({
//   first_name: z.string().min(1, "Full Name is required."),
//   last_name: z.string().min(1, "Full Name is required."),
//   phone: z.string().min(1, "Phone number is required."),
//   username: z.string().min(1, "Username is required."),
//   password: z.string().min(1, "Password is required."),
//   unit: z.string().min(1, "Unit number is required."),
//   role: z.string().min(1, "Role is required."),
//   status: z.string().min(1, "Status is required."),
// });

// export default function MyForm() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       first_name: "",
//       last_name: "",
//       phone: "",
//       username: "",
//       password: "",
//       unit: "",
//       role: "", // Set a default value for role, like "admin"
//       status: "", // Set a default value for status, like "active"
//     },
//   });

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     setIsLoading(true); // Show loading spinner
//     setError("");

//     const userData = { ...values };

//     // Simulate a delay of 1 second for the loading spinner
//     setTimeout(async () => {
//       try {
//         const response = await fetch("/api/users/create", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(userData),
//         });

//         if (!response.ok) {
//           const result = await response.json();
//           console.log(result.error);

//           if (result.error == "taken") {
//             setError(
//               result.error ||
//                 "Username is already taken. Please choose another."
//             );
//             toast.error("Username is already taken. Please choose another.");
//           } else {
//             setError(result.error || "An unknown error occurred");
//             toast.error(result.error || "An unknown error occurred");
//           }
//         } else {
//           toast.success("User created successfully");
//           router.push("/users/listusers");
//         }
//       } catch (error) {
//         setError("An error occurred while creating the user");
//         toast.error("An error occurred while creating the user");
//       } finally {
//         setIsLoading(false); // Hide loading spinner after 1 second
//       }
//     }, 1000); // 1 second delay
//   };

//   return (
//     <>
//       {isLoading ? (
//         <Loading />
//       ) : (
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-8 max-w-3xl mx-auto py-10 px-4" // Add px-4 for padding on small screens
//           >
//             <div className="grid grid-cols-12 gap-4">
//               <div className="col-span-12 sm:col-span-6">
//                 <FormField
//                   control={form.control}
//                   name="first_name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>First Name</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="First Name"
//                           type="text"
//                           {...field}
//                           className="px-4 py-2" // Add padding inside the input field
//                         />
//                       </FormControl>
//                       <FormDescription>Enter your First Name</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="col-span-12 sm:col-span-6">
//                 <FormField
//                   control={form.control}
//                   name="last_name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Last Name</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="Last Name"
//                           type="text"
//                           {...field}
//                           className="px-4 py-2" // Add padding inside the input field
//                         />
//                       </FormControl>
//                       <FormDescription>Enter your Last Name</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-12 gap-4">
//               <div className="col-span-12 sm:col-span-6">
//                 <FormField
//                   control={form.control}
//                   name="username"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Username</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="Username"
//                           type="text"
//                           {...field}
//                           className="px-4 py-2" // Add padding inside the input field
//                         />
//                       </FormControl>
//                       <FormDescription>Enter your Username</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

// <div className="col-span-12 sm:col-span-6">
//   <FormField
//     control={form.control}
//     name="password"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Password</FormLabel>
//         <FormControl>
//           <Input
//             type="password"
//             placeholder="Password"
//             {...field}
//             className="px-4 py-2" // Add padding inside the input field
//           />
//         </FormControl>
//         <FormDescription>Enter your password.</FormDescription>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </div>
//             </div>

//             <div className="grid grid-cols-12 gap-4">
//               <div className="col-span-12 sm:col-span-6">
//                 <FormField
//                   control={form.control}
//                   name="phone"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone Number</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="Phone Number"
//                           type="text"
//                           {...field}
//                           className="px-4 py-2" // Add padding inside the input field
//                         />
//                       </FormControl>
// <FormDescription>Enter your Phone Number</FormDescription>
// <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="col-span-12 sm:col-span-6">
//                 <FormField
//                   control={form.control}
//                   name="unit"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Unit Number</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="Unit Number"
//                           type="text"
//                           {...field}
//                           className="px-4 py-2" // Add padding inside the input field
//                         />
//                       </FormControl>
//                       <FormDescription>Enter Unit Number</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-12 gap-4">
//               <div className="col-span-12 sm:col-span-6">
//                 <FormField
//                   control={form.control}
//                   name="role"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Role</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Role" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="admin">Admin</SelectItem>
//                           <SelectItem value="resident">Resident</SelectItem>
//                           <SelectItem value="security">
//                             Security Guard
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormDescription>Role of User</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
// <div className="col-span-12 sm:col-span-6">
//   <FormField
//     control={form.control}
//     name="status"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Status</FormLabel>
//         <Select
//           onValueChange={field.onChange}
//           defaultValue={field.value}
//         >
//           <FormControl>
//             <SelectTrigger>
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//           </FormControl>
//           <SelectContent>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="inactive">Inactive</SelectItem>
//           </SelectContent>
//         </Select>
//         <FormDescription>Status of User</FormDescription>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </div>
//             </div>
//             <Button type="submit">Submit</Button>
//             <Button
//               type="button"
//               onClick={() => router.push("/users/listusers")}
//               disabled={isLoading}
//             >
//               {isLoading ? "Submitting..." : "Cancel"}
//             </Button>
//           </form>
//         </Form>
//       )}
//       {/* Toast container to show toasts */}
//       <ToastContainer position="top-right" autoClose={3000} />
//     </>
//   );
// }

"use client";
import { useState } from "react";
// import { toast } from "sonner";
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
import Loading from "@/app/loading"; // Import your loading component

const formSchema = z
  .object({
    // first_name: z.string().min(1, "Full Name is required."),
    // last_name: z.string().min(1, "Full Name is required."),
    // phone: z.string().min(1, "Phone number is required."),
    username: z.string().min(1, "Username is required."),
    password: z.string().min(1, "Password is required."),
    // unit: z.string().min(1, "Unit number is required."),
    role: z.string().min(1, "Role is required."),
    status: z.string().min(1, "Status is required."),
    resident_first_name: z.string().optional(),
    resident_last_name: z.string().optional(),
    resident_phone_number: z.string().optional(),
    resident_house_number: z.string().optional(),
    resident_address: z.string().optional(),
    security_first_name: z.string().optional(),
    security_last_name: z.string().optional(),
    security_phone_number: z.string().optional(),
    security_shift: z.string().optional(),
    Resident_error_message: z.string().optional(),
    Security_error_message: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "resident") {
        return (
          data.resident_first_name &&
          data.resident_last_name &&
          data.resident_phone_number &&
          data.resident_house_number &&
          data.resident_address
        );
      }
      return true; // No validation if role is not "resident"
    },

    {
      message: "Resident fields are required when role is 'Resident'.",
      path: ["Resident_error_message"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "security") {
        return (
          data.security_first_name &&
          data.security_last_name &&
          data.security_phone_number &&
          data.security_shift
        );
      }
      return true; // No validation if role is not "security"
    },
    {
      message: "Security fields are required when role is 'Security'.",
      path: ["Security_error_message"],
    }
  );
export default function MyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(""); // New state to track the role selection
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "",
      status: "",
      resident_first_name: "",
      resident_last_name: "",
      resident_phone_number: "",
      resident_house_number: "",
      resident_address: "",
      security_first_name: "",
      security_last_name: "",
      security_phone_number: "",
      security_shift: "",
      Resident_error_message: "",
      Security_error_message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Show loading spinner
    setError("");
    console.log("values");

    const userData = { ...values };

    // Simulate a delay of 1 second for the loading spinner
    setTimeout(async () => {
      try {
        const response = await fetch("/api/users/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const result = await response.json();
          console.log(result.error);

          if (result.error == "taken") {
            setError(
              result.error ||
                "Username is already taken. Please choose another."
            );
            toast.error("Username is already taken. Please choose another.");
          } else {
            setError(result.error || "An unknown error occurred");
            toast.error(result.error || "An unknown error occurred");
          }
        } else {
          toast.success("User created successfully");
          router.push("/users/listusers");
        }
      } catch (error) {
        setError("An error occurred while creating the user");
        toast.error("An error occurred while creating the user");
      } finally {
        setIsLoading(false); // Hide loading spinner after 1 second
      }
    }, 1000); // 1 second delay
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
                            />
                          </FormControl>
                          <FormDescription>Resident Address</FormDescription>
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
                      name="security_shift"
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

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="mt-4">
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      )}
      <ToastContainer />
    </>
  );
}
