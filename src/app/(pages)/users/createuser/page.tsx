import React from "react";
import UserCreation from "@/app/components/users/create-user";
const page = async () => {
  return (
    <div>
      <UserCreation /> {/* UserCreation component for creating a new user */}
    </div>
  );
};

export default page;
