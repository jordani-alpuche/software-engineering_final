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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false); // For conditional client-side rendering
  const { data: session, status } = useSession();

  // Ensures `ToastContainer` renders only on the client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show the global loading spinner if session is loading or if client is not ready
  if (!isClient || status === "loading") {
    return <Loading />; // Use the global loading spinner component
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setError(""); // Reset error message

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Log the credentials for debugging
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // Prevent automatic redirection
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      router.push("/dashboard"); // Redirect to dashboard on success
    }
  };

  return (
    <>
      {isLoading && <Loading />} {/* Global loading spinner */}
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

              {error && <p className="text-red-500 text-sm">{error}</p>}

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

            <div className="mt-4 text-center text-sm">
              <a
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </CardContent>
        </Card>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}
