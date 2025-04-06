import { User } from "@/api/entities";
import { useUser } from "@/context/UserContext";

// Define super admin email
const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

// Function to check if the current user has access to the system
export async function checkUserAccess() {
  try {
    // Get current user from context
    const { currentUser } = useUser();

    // שליפת נתוני המשתמש דרך השרת על בסיס JWT בלבד
    const user = await User.me(); 
    if (!user || !user.email) {
      console.warn("⛔️ User not found or not authenticated");
      return false;
    }

    // Super admin תמיד מקבל גישה
    if (user.email === SUPER_ADMIN_EMAIL) {
      return true;
    }

    // רק משתמשים מאושרים מקבלים גישה
    if (user.status !== "approved") {
      console.warn("⛔️ User exists but is not approved:", user.email);
      return false;
    }

    return true;
  } catch (error) {
    console.log("❌ Error checking user access:", error);
    return false;
  }
}
