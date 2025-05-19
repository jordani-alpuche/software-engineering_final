import React, { ReactNode } from "react";
import  {WrapperProps} from "@/app/types/interfaces";


const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {children}
    </div>
  );
};

export default Wrapper;
