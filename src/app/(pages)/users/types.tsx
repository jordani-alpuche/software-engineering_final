export interface MyUser {
  id: string;
  username: string;
  password?: string; // Optional since passwords may not always be returned
  role: "admin" | "resident" | "security";
  status: "active" | "inactive";

  // Resident-specific fields
  resident_first_name?: string;
  resident_last_name?: string;
  resident_email?: string;
  resident_phone_number?: string;
  resident_address?: string;
  resident_house_number?: string;

  // Security-specific fields
  security_first_name?: string;
  security_last_name?: string;
  security_email?: string;
  security_phone_number?: string;
  security_address?: string;
  security_access_point?: number;
  security_shift?: string;

  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}
