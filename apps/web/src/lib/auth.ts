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
 * Reads authenticated user data from cookies set during login/register.
 * Falls back to a guest student profile if no cookies are found.
 */
export async function getUser(): Promise<UserProfile> {
  const cookieStore = await cookies();
  
  const userId = cookieStore.get("user_id")?.value;
  const userName = cookieStore.get("user_name")?.value;
  const userEmail = cookieStore.get("user_email")?.value;
  const userRole = cookieStore.get("user_role")?.value;

  // If real user data exists in cookies, return it
  if (userId && userEmail && userRole) {
    return {
      id: userId,
      name: userName || userEmail,
      email: userEmail,
      role: (userRole === "ADMIN" ? "ADMIN" : "STUDENT") as "ADMIN" | "STUDENT",
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
    };
  }

  // Legacy fallback: legacy mock cookie "role" for backward compatibility
  const legacyRole = cookieStore.get("role")?.value;
  if (legacyRole === "admin") {
    return {
      id: "admin-1",
      name: "Admin E-learning",
      email: "admin@system.local",
      role: "ADMIN",
      avatar: "https://i.pravatar.cc/150?u=admin",
    };
  }

  // Default unauthenticated fallback
  return {
    id: "guest",
    name: "Khách",
    email: "guest@school.edu.vn",
    role: "STUDENT",
    avatar: "https://i.pravatar.cc/150?u=guest",
  };
}
