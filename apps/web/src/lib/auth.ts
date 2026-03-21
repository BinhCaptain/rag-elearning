import "server-only";

import { cookies } from "next/headers";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  avatar: string;
};

/**
 * A simple dummy util to fake user auth before we implement the API backend.
 */
export async function getUser(): Promise<UserProfile> {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role === "admin") {
    return {
      id: "admin-1",
      name: "Admin E-learning",
      email: "admin",
      role: "ADMIN",
      avatar: "https://i.pravatar.cc/150?u=admin",
    };
  }

  // Default fallback
  return {
    id: "user-123",
    name: "Học sinh THCS",
    email: "student@school.edu.vn",
    role: "STUDENT",
    avatar: "https://i.pravatar.cc/150?u=student",
  };
}
