import { RegisteredUser } from "@/api/entities";
import { User } from "@/api/entities";

// Define super admin email
const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

// Function to check if the current user has access to the system
export async function checkUserAccess() {
  try {
    // Get current user
    const user = await User.me();
    
    if (!user || !user.email) {
      return false;
    }
    
    // Super admin always has access
    if (user.email === SUPER_ADMIN_EMAIL) {
      return true;
    }
    
    // Check registered users
    const registeredUsers = await RegisteredUser.filter({ email: user.email });
    
    if (registeredUsers.length === 0) {
      return false;
    }
    
    // Get the latest record for this user
    const sortedUsers = [...registeredUsers].sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    );
    
    // Make sure we handle the case where status might be undefined or invalid
    const status = sortedUsers[0].status;
    return status === "approved"; // Only return true if explicitly approved
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
}