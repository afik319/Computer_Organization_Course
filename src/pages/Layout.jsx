
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Book, GraduationCap, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User, AllowedEmail } from "@/api/entities";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";
  
  useEffect(() => {
    document.title = "אקדמיקס פרו - קורס ארגון המחשב";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'פלטפורמת הלמידה המובילה לקורס ארגון המחשב');
    }

    const checkUserAuthorization = async () => {
      try {
        setLoading(true);
        const user = await User.me();
        setCurrentUser(user);
        
        console.log("Checking authorization for user:", user.email);
        
        // Super admin always has access
        if (user.email === SUPER_ADMIN_EMAIL) {
          console.log("User is super admin, authorized");
          setIsAuthorized(true);
          setLoading(false);
          return;
        }
        
        // Check if email is in allowed list
        console.log("Checking if email is in allowed list");
        const allowedEmails = await AllowedEmail.list();
        const isAllowed = allowedEmails.some(item => item.email.toLowerCase() === user.email.toLowerCase());
        
        if (isAllowed) {
          console.log("Email is in allowed list, authorized");
          setIsAuthorized(true);
          
          // Update user preferences to mark as approved
          try {
            const userPrefs = user.preferences || {};
            await User.updateMyUserData({ 
              preferences: { ...userPrefs, is_approved: true } 
            });
            console.log("Updated user preferences");
          } catch (err) {
            console.error("Error updating user preferences:", err);
          }
        } else {
          console.log("Email not in allowed list, unauthorized");
          setIsAuthorized(false);
          navigate(createPageUrl("Unauthorized"));
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAuthorization();
  }, [navigate]);
  
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
  
  const navigation = [
    { name: 'דף הבית', icon: LayoutDashboard, href: createPageUrl('Dashboard') },
    { name: 'שיעורים', icon: Book, href: createPageUrl('Lessons') },
    { name: 'בחינות', icon: GraduationCap, href: createPageUrl('Exams') },
  ];

  if (isSuperAdmin) {
    navigation.push({ name: 'ניהול הרשאות', icon: Shield, href: createPageUrl('UserManagement') });
  }

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

  if (!isAuthorized && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">אין לך גישה</h1>
          <p className="text-lg text-gray-600 mb-6">
            חשבון המשתמש שלך עדיין לא אושר לגישה למערכת זו.
            אנא פנה למנהל המערכת לקבלת הרשאות.
          </p>
          <Button
            onClick={() => User.logout()}
            className="w-full py-2 text-lg"
          >
            <LogOut className="ml-2 h-5 w-5" />
            התנתק
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style jsx global>{`
        :root {
          --font-family: 'Rubik', 'Noto Sans Hebrew', sans-serif;
          --color-primary: #1e3a8a;
          --color-primary-light: #3b82f6;
          --color-secondary: #64748b;
          --color-accent: #0f766e;
          --color-background: #f8fafc;
          --color-card: #ffffff;
          --color-text: #334155;
          --color-text-light: #64748b;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
          --border-radius: 10px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
          --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
        }

        body {
          font-family: var(--font-family);
          color: var(--color-text);
          line-height: 1.5;
          background-color: var(--color-background);
        }

        h1, h2, h3, h4, h5, h6 {
          font-weight: 700;
          margin-bottom: var(--spacing-md);
        }

        h1 {
          font-size: 32px;
        }

        h2 {
          font-size: 28px;
        }

        h3 {
          font-size: 24px;
        }

        p {
          font-size: 16px;
          margin-bottom: var(--spacing-md);
        }

        button, .button {
          font-size: 18px;
          font-weight: 700;
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          transition: all 0.2s ease;
        }

        .card {
          background-color: var(--color-card);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-md);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        input, select, textarea {
          font-family: var(--font-family);
          font-size: 16px;
          padding: var(--spacing-md);
          border-radius: var(--border-radius);
          border: 1px solid var(--color-secondary);
          transition: border-color 0.2s ease;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 right-0 left-0 z-10 bg-white shadow-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            className="w-auto h-10 ml-6"
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/149dcc_c9f6f1d8-6f78-405c-b2dd-3663c0fe03f1.jpeg"
            alt="Academix Pro Logo"
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
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-base"
          onClick={() => User.logout()}
        >
          <LogOut className="ml-1 h-4 w-4" />
          התנתק
        </Button>
      </header>

      {/* Main content */}
      <main className="pt-20 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
