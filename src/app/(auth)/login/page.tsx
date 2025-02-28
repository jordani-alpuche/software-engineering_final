import React from "react";
import LoginForm from "@/app/components/auth/login-form";
import { toast, ToastContainer } from "react-toastify";
const page = () => {
  return (
    <>
      {/* <ToastContainer /> */}
      <LoginForm />
    </>
  );
};

export default page;
