"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/components/loading"; // Import the global loading component

export default function LoginForm() {
  const router = useRouter(); // Router for navigation
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [error, setError] = useState(""); // To store and display login error
  const [isClient, setIsClient] = useState(false); // To ensure client-side rendering only
  const { data: session, status } = useSession(); // Get session and loading status

  // Ensure components like ToastContainer only render on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show global spinner while session is loading or before client renders
  if (!isClient || status === "loading") {
    return <Loading />;
  }

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent full page reload
    setIsLoading(true);
    setError(""); // Clear previous errors

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Attempt to sign in using NextAuth credentials provider
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // Prevent redirect so we can handle manually
    });

    // Handle login result
    if (result?.error) {
      setIsLoading(false);
      setError(result.error); // Show error message
      toast.error(result.error); // Display toast notification
    } else {
      router.push("/dashboard"); // Redirect on success
    }
  };

  return (
    <>
      {isLoading && <Loading />}{" "}
      {/* Global loading spinner during form submission */}
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username input with icon */}
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="username"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password input with icon */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Error message display */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Submit button with loading indicator */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span className="ml-2">Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Forgot password link */}
            {/* <div className="mt-4 text-center text-sm">
              <a
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div> */}
          </CardContent>
        </Card>
        {/* Toast notification container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}
