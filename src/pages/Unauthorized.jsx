import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { Shield, Mail, AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">אין לך גישה לקורס</h1>
          
          <p className="text-lg text-gray-600 mb-6">
            כתובת האימייל שלך אינה מורשית לצפייה בתוכן הקורס.
            אנא פנה למנהל המערכת לקבלת הרשאות גישה.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <Mail className="h-5 w-5" />
              <span className="font-medium">afik.ratzon@gmail.com</span>
            </div>
          </div>
          
          <Button
            onClick={() => User.logout()}
            className="w-full py-3 text-lg"
          >
            התנתק
          </Button>
        </div>
      </div>
    </div>
  );
}