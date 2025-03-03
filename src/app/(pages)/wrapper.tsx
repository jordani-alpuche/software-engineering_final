import React from "react";

const Wrapper = ({ children }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {children}
    </div>
  );
};

export default Wrapper;
