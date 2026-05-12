import { getUser } from "@/lib/auth";
import AdminChatPage from "./admin-chat";
import StudentChatPage from "./student-chat";

export default async function ChatPage() {
  const user = await getUser();

  if (user.role === "ADMIN") {
    return <AdminChatPage />;
  }

  return <StudentChatPage />;
}
