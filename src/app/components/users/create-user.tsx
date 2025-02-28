// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Mail, Lock, Phone, House } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function UserRegistrationForm() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     const formData = new FormData(e.currentTarget);
//     const name = formData.get("name") as string;
//     const username = formData.get("username") as string;
//     const password = formData.get("password") as string;
//     const phone = formData.get("phone") as string;
//     const role = formData.get("role") as string;
//     const unit = formData.get("unit") as string;

//     const userData = { name, username, password, phone, role, unit };

//     try {
//       const response = await fetch("/api/users/create", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userData),
//       });

//       if (!response.ok) {
//         const result = await response.json();
//         setError(result.error || "An unknown error occurred");
//         toast.error(result.error || "An unknown error occurred");
//       } else {
//         toast.success("User created successfully");
//         router.push("/user/listusers");
//       }
//     } catch (error) {
//       setError("An error occurred while creating the user");
//       toast.error("An error occurred while creating the user");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Create User</CardTitle>
//           <CardDescription>
//             Enter your information below to create a new user account.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="name">Name</Label>
//               <Input
//                 type="text"
//                 id="name"
//                 name="name"
//                 placeholder="Full Name"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="username">Username</Label>
//               <Input
//                 type="text"
//                 id="username"
//                 name="username"
//                 placeholder="Username"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 type="password"
//                 id="password"
//                 name="password"
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="phone">Phone Number</Label>
//               <Input
//                 type="text"
//                 id="phone"
//                 name="phone"
//                 placeholder="Phone Number"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="unit">Unit Number</Label>
//               <Input
//                 type="text"
//                 id="unit"
//                 name="unit"
//                 placeholder="Unit Number"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="role">Role</Label>
//               <Select name="role" required>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="Select Role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectGroup>
//                     <SelectLabel>Roles</SelectLabel>
//                     <SelectItem value="admin">Admin</SelectItem>
//                     <SelectItem value="owner">Home Owner</SelectItem>
//                     <SelectItem value="security">Security Guard</SelectItem>
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//             </div>

//             {error && <p className="text-red-500 text-sm">{error}</p>}

//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? "Creating..." : "Create User"}
//             </Button>
//           </form>
//           <ToastContainer position="top-right" autoClose={3000} />
//         </CardContent>
//       </Card>
//     </div>
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
import Link from "next/link";
import Loading from "@/app/loading"; // Import your loading component

const formSchema = z.object({
  first_name: z.string().min(1, "Full Name is required."),
  last_name: z.string().min(1, "Full Name is required."),
  phone: z.string().min(1, "Phone number is required."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  unit: z.string().min(1, "Unit number is required."),
  role: z.string().min(1, "Role is required."),
  status: z.string().min(1, "Status is required."),
});

export default function MyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      username: "",
      password: "",
      unit: "",
      role: "", // Set a default value for role, like "admin"
      status: "", // Set a default value for status, like "active"
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Show loading spinner
    setError("");

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
            className="space-y-8 max-w-3xl mx-auto py-10 px-4" // Add px-4 for padding on small screens
          >
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
                          className="px-4 py-2" // Add padding inside the input field
                        />
                      </FormControl>
                      <FormDescription>Enter your First Name</FormDescription>
                      <FormMessage />
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
                          className="px-4 py-2" // Add padding inside the input field
                        />
                      </FormControl>
                      <FormDescription>Enter your Last Name</FormDescription>
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Username"
                          type="text"
                          {...field}
                          className="px-4 py-2" // Add padding inside the input field
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

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone Number"
                          type="text"
                          {...field}
                          className="px-4 py-2" // Add padding inside the input field
                        />
                      </FormControl>
                      <FormDescription>Enter your Phone Number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Unit Number"
                          type="text"
                          {...field}
                          className="px-4 py-2" // Add padding inside the input field
                        />
                      </FormControl>
                      <FormDescription>Enter Unit Number</FormDescription>
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              onClick={() => router.push("/users/listusers")}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Cancel"}
            </Button>
          </form>
        </Form>
      )}
      {/* Toast container to show toasts */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
