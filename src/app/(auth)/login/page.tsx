import React from "react";
import LoginForm from "@/app/components/auth/login-form";
import { toast, ToastContainer } from "react-toastify";
const page = () => {
  return (
    <>
      <LoginForm /> {/* LoginForm component for user login */}
    </>
  );
};

export default page;
