import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.log("Error during logout:", error);
      // Even if logout fails, redirect to dashboard
      navigate(createPageUrl("Dashboard"));
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">אין לך הרשאות גישה</h1>
        <p className="text-xl text-gray-600 mb-8">
          ההרשאות שלך למערכת בוטלו או נמחקו על ידי מנהל המערכת.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          אם לדעתך מדובר בטעות, אנא פנה למנהל המערכת לחידוש ההרשאות.
        </p>
        <Button
          onClick={handleLogout}
          className="w-full py-3 text-xl"
        >
          <LogOut className="ml-2 h-5 w-5" />
          חזרה לעמוד הראשי
        </Button>
      </div>
    </div>
  );
}