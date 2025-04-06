
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Book, GraduationCap, LogOut, Shield, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisteredUser } from "@/api/entities";
import { User } from "@/api/User";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useGoogleAuth } from "@/auth/GoogleAuth";
import { useUser } from "../context/UserContext";

const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

export default function Layout({ children, currentPageName }) {
  const { login, logout } = useGoogleAuth(); 
  const [userPermission, setUserPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const { currentUser, setCurrentUser } = useUser();

  // Check if user has permission to access the system - wrapped in useCallback
  const checkUserPermission = useCallback(async (email) => {
    if (!email) return null;
        
    if (email === SUPER_ADMIN_EMAIL) 
      return "approved";
    
    try {
      const registeredUsers = await RegisteredUser.list();
      const userRecords = registeredUsers.filter(user => user.email === email);
            
      if (userRecords.length === 0) {
        console.log("User not registered");
        return null;
      }
      
      const sortedUsers = [...userRecords].sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      );
      
      const latestStatus = sortedUsers[0].status || null;
      
      if (latestStatus === "approved" || latestStatus === "pending" || latestStatus === "rejected") {
        return latestStatus;
      } else {
        console.log("Invalid status found:", latestStatus);
        return null;
      }
    } catch (error) {
      console.log("Error checking permissions:", error);
      return null;
    }
  }, []);

  // Request access for the current user
  const requestAccess = async () => {
    if (!currentUser || !currentUser.email) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לבקש הרשאות כרגע, נסה להתחבר מחדש",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const existingRequests = await RegisteredUser.filter({ email: currentUser.email });
      
      if (existingRequests.some(req => req.status === "pending")) {
        setUserPermission("pending");
        setRequestSent(true);
        toast({
          title: "בקשה קיימת",
          description: "בקשת הרשאות כבר קיימת במערכת וממתינה לאישור",
        });
        return;
      }
      
      await RegisteredUser.create({
        email: currentUser.email,
        full_name: currentUser.full_name || "",
        status: "pending",
        request_date: new Date().toISOString()
      });
      
      console.log("Created permission request for:", currentUser.email);
      
      setUserPermission("pending");
      setRequestSent(true);
      
      toast({
        title: "בקשתך נשלחה",
        description: "בקשת ההרשאות נשלחה בהצלחה, המנהל יבדוק אותה בהקדם",
      });
    } catch (error) {
      console.log("Error requesting access:", error);
      toast({
        title: "שגיאה בשליחת הבקשה",
        description: "אירעה שגיאה בשליחת בקשת ההרשאות",
        variant: "destructive"
      });
    }
  };

  // Function to manually refresh permission status
  const refreshPermissionStatus = async () => {
    if (!currentUser?.email) return;
    
    setCheckingPermission(true);
    try {
      const permission = await checkUserPermission(currentUser.email);
      
      if (permission !== userPermission) {
        setUserPermission(permission);
        
        if (permission === "approved") {
          toast({
            title: "הרשאות אושרו",
            description: "בקשת ההרשאות שלך אושרה. מיד תועבר לדף הבית.",
          });
          
          setTimeout(() => {
            navigate(createPageUrl("Dashboard"));
          }, 1000);
        }
      } else if (permission === "pending") {
        toast({
          title: "עדיין בהמתנה",
          description: "בקשת ההרשאות שלך עדיין ממתינה לאישור המנהל",
        });
      } else if (permission === "rejected") {
        toast({
          title: "בקשה נדחתה",
          description: "בקשת ההרשאות שלך נדחתה על ידי המנהל",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.log("Error refreshing permission:", error);
    } finally {
      setCheckingPermission(false);
    }
  };

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const user = await User.me();
        if (user) {
          setCurrentUser(user);
    
          const permission = await checkUserPermission(user.email); // ✅ חדש
          setUserPermission(permission); // ✅ חדש
        }
      } catch (err) {
        console.log("❌ Failed to restore user:", err);
      } finally {
        setPermissionsLoaded(true);
        setLoading(false);
      }
    };    
  
    restoreUser();
  }, [setCurrentUser]);
  
  const handleLogin = async () => {
    try {
      // מבצע את ההתחברות
      const userInfo = await login();
  
      if (!userInfo || typeof userInfo.email !== 'string' || !userInfo.email.trim()) {
        console.log('Invalid user data, email missing');
        return;
      }
  
      // עדכון המידע של המשתמש ב-UserContext
      setCurrentUser(userInfo);
  
      // בודק את ההרשאות של המשתמש
      const permission = await checkUserPermission(userInfo.email);
      setUserPermission(permission);
  
      // אם ההרשאות מאושרות, מעביר לדף הבית
      if (permission === "approved") {
        navigate(createPageUrl("Dashboard"));
      }
    } 
    catch (error) {
      console.log("Login error:", error);
    }
  };
  

  const handleLogout = async () => {
    try {
      logout();             // קורא ל-POST /logout
      setCurrentUser(null);       // מנקה את המשתמש מה־context
      setUserPermission(null);    // אופציונלי: מנקה גם את ההרשאות
      navigate("/");              // חוזר לדף הראשי
    } catch (error) {
      console.log('Logout error:', error);
    }
  };  

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">התחברות נדרשת</h1>
          <p className="text-lg text-gray-600 mb-6">
            יש להתחבר למערכת כדי לצפות בתוכן הקורס
          </p>
          <Button
            onClick={handleLogin}
            className="w-full py-2 text-lg"
          >
            התחברות עם Google
          </Button>
        </div>
      </div>
    );
  }

  if (permissionsLoaded && userPermission !== "approved" && currentUser.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">אין לך הרשאות גישה</h1>
          
          {userPermission === "pending" ? (
            <>
              <p className="text-lg text-gray-600 mb-6">
                בקשת ההרשאות שלך נשלחה וממתינה לאישור מנהל המערכת.
              </p>
              <p className="text-md text-gray-500 mb-6">
                לאחר אישור הבקשה תוכל להיכנס למערכת.
              </p>
              <Button
                onClick={refreshPermissionStatus}
                disabled={checkingPermission}
                variant="outline"
                className="flex items-center justify-center gap-2 mx-auto"
              >
                {checkingPermission ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                בדיקת סטטוס הרשאות
              </Button>
            </>
          ) : userPermission === "rejected" ? (
            <>
              <p className="text-lg text-gray-600 mb-6">
                בקשת ההרשאות שלך נדחתה על ידי מנהל המערכת.
              </p>
              <p className="text-md text-gray-500 mb-6">
                אם לדעתך מדובר בטעות, אנא צור קשר עם מנהל המערכת.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-600 mb-6">
                כדי לצפות בתוכן הקורס, יש לבקש הרשאות גישה ממנהל המערכת.
              </p>
              <Button
                onClick={requestAccess}
                disabled={requestSent}
                className="w-full py-2 text-lg bg-teal-600 hover:bg-teal-700"
              >
                {requestSent ? "בקשה נשלחה" : "בקש הרשאות גישה"}
              </Button>
            </>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-gray-600"
            >
              <LogOut className="ml-2 h-4 w-4" />
              התנתק
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main layout for users with permission
  const navigation = [
    { name: 'דף הבית', icon: LayoutDashboard, href: createPageUrl('Dashboard') },
    { name: 'שיעורים', icon: Book, href: createPageUrl('Lessons') },
    { name: 'בחינות', icon: GraduationCap, href: createPageUrl('Exams') },
  ];

  if (permissionsLoaded && currentUser?.email === SUPER_ADMIN_EMAIL) {
    navigation.push({ name: 'ניהול הרשאות', icon: Shield, href: createPageUrl('UserManagement') });
  }
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="fixed top-0 right-0 left-0 z-10 bg-white shadow-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            className="w-auto h-10 ml-6"
            src="https://afik-app-uploads-public.s3.us-east-1.amazonaws.com/uploads/academix-pro-logo.jpeg"
            alt="Logo"
          />
          
          <div className="flex items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-4 py-2 text-lg font-medium transition-colors relative ml-4",
                  currentPageName === item.name
                    ? "text-blue-800 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-full after:h-0.5 after:bg-blue-800"
                    : "text-gray-600 hover:text-blue-800"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {currentUser?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-base"
            onClick={handleLogout}
          >
            <LogOut className="ml-1 h-4 w-4" />
            התנתק
          </Button>
        </div>
      </header>

      <main className="pt-20 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
