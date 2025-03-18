
import React, { useState, useEffect } from "react";
import { User, AllowedEmail } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Trash2, 
  Search, 
  Mail, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  BanIcon
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailNotes, setEmailNotes] = useState("");
  const [processingEmail, setProcessingEmail] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  
  const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL) {
          toast({
            title: "אין גישה",
            description: "אין לך הרשאות לצפות בעמוד זה",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        navigate("/");
      }
    };
    
    checkAccess();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedEmails] = await Promise.all([
        User.list(),
        AllowedEmail.list("-invited_date")
      ]);
      
      setUsers(fetchedUsers);
      setAllowedEmails(fetchedEmails);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בטעינת הנתונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAllowedEmail = async (emailToAdd, notes = '') => {
    if (!emailToAdd || !emailToAdd.includes('@')) {
      toast({
        title: "שגיאה",
        description: "יש להזין כתובת אימייל תקינה",
        variant: "destructive",
      });
      return false;
    }
    
    const normalizedEmail = emailToAdd.toLowerCase();
    setProcessingEmail(normalizedEmail);
    
    try {
      const existingEmails = await AllowedEmail.list();
      if (existingEmails.some(item => item.email.toLowerCase() === normalizedEmail)) {
        toast({
          title: "שגיאה",
          description: "כתובת האימייל כבר קיימת ברשימה",
          variant: "destructive",
        });
        setProcessingEmail("");
        return false;
      }
      
      await AllowedEmail.create({
        email: normalizedEmail,
        notes: notes,
        invited_by: SUPER_ADMIN_EMAIL,
        invited_date: new Date().toISOString()
      });
      
      toast({
        title: "נוסף בהצלחה",
        description: "כתובת האימייל התווספה לרשימת המורשים",
      });
      
      setNewEmail("");
      setEmailNotes("");
      setShowAddDialog(false);
      loadData();
      return true;
    } catch (error) {
      console.error("Error adding email:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת כתובת האימייל",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingEmail("");
    }
  };

  const handleRemoveAllowedEmail = async (id) => {
    try {
      await AllowedEmail.delete(id);
      toast({
        title: "הוסר בהצלחה",
        description: "כתובת האימייל הוסרה מרשימת המורשים",
      });
      loadData();
      return true;
    } catch (error) {
      console.error("Error removing email:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהסרת כתובת האימייל",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleRemoveAllowedEmailByAddress = async (email) => {
    try {
      const emailRecords = await AllowedEmail.filter({ email: email.toLowerCase() });
      
      if (emailRecords.length === 0) {
        toast({
          title: "לא נמצא",
          description: "לא נמצאו רשומות עבור כתובת האימייל הזו",
        });
        return false;
      }

      for (const record of emailRecords) {
        await AllowedEmail.delete(record.id);
      }

      toast({
        title: "הוסר בהצלחה",
        description: "כתובת האימייל הוסרה מרשימת המורשים",
      });

      loadData();
      return true;
    } catch (error) {
      console.error("Error removing email by address:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהסרת כתובת האימייל",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleApproveUser = async (user) => {
    try {
      const result = await handleAddAllowedEmail(user.email, `אושר ידנית: ${user.full_name || ''}`);
      if (result) {
        toast({
          title: "משתמש אושר",
          description: `המשתמש ${user.email} אושר בהצלחה`,
        });
        loadData();
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה באישור המשתמש",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (user) => {
    toast({
      title: "משתמש נדחה",
      description: `המשתמש ${user.email} נדחה בהצלחה`,
    });
    
    setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
  };

  const handleRevokeUser = async (user) => {
  try {
    const emailRecord = allowedEmails.find(item => item.email.toLowerCase() === user.email.toLowerCase());
    if (emailRecord) {
      // מחיקה מה-allowedEmails
      await handleRemoveAllowedEmail(emailRecord.id);

      // מחיקת המשתמש מהרשימה
      setUsers(prevUsers => prevUsers.filter(u => u.email !== user.email));

      toast({
        title: "משתמש נמחק",
        description: `המשתמש ${user.email} נמחק בהצלחה`,
      });

      loadData(); // רענון הנתונים אחרי המחיקה
    } else {
      toast({
        title: "לא נמצא",
        description: "לא נמצאה כתובת אימייל עבור משתמש זה",
      });
    }
  } catch (error) {
    console.error("Error revoking user:", error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה במחיקת המשתמש",
      variant: "destructive",
    });
  }
};


  const isUserApproved = (user) => {
    if (user.email === SUPER_ADMIN_EMAIL) return true;
    return isEmailInAllowedList(user.email);
  };

  const isEmailInAllowedList = (email) => {
    return allowedEmails.some(item => item.email.toLowerCase() === email.toLowerCase());
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAllowedEmails = allowedEmails.filter(item => 
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefreshData = () => {
    loadData();
    toast({
      title: "הנתונים עודכנו",
      description: "רשימת המשתמשים עודכנה בהצלחה",
    });
  };

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <div className="sticky top-20 bg-gray-50 z-10 pb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">ניהול משתמשים והרשאות</h1>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefreshData}
          >
            <RefreshCcw className="w-4 h-4 ml-2" />
            רענון נתונים
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="flex rounded-lg border bg-white p-1">
            <Button
              type="button"
              variant={activeTab === "users" ? "default" : "ghost"}
              className={`flex-1 text-lg ${activeTab === "users" ? "bg-gray-900 text-white" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              משתמשים רשומים
            </Button>
            <Button
              type="button"
              variant={activeTab === "emails" ? "default" : "ghost"}
              className={`flex-1 text-lg ${activeTab === "emails" ? "bg-gray-900 text-white" : ""}`}
              onClick={() => setActiveTab("emails")}
            >
              אימיילים מורשים
            </Button>
          </div>
          
          <div className="my-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="חיפוש..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-full text-lg text-right"
                dir="rtl"
              />
            </div>
            
            {activeTab === "emails" && (
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-teal-600 hover:bg-teal-700 text-lg"
              >
                <UserPlus className="ml-2 h-5 w-5" />
                הוספת אימייל
              </Button>
            )}
          </div>
        </div>
      </div>

      {activeTab === "users" ? (
        <Card>
          <CardHeader className="text-right">
            <CardTitle>משתמשים רשומים</CardTitle>
            <CardDescription>רשימת כל המשתמשים הרשומים במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
                <p className="text-lg">לא נמצאו משתמשים התואמים את החיפוש</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם מלא</TableHead>
                      <TableHead className="text-right">אימייל</TableHead>
                      <TableHead className="text-right">תאריך הצטרפות</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-center">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-right">{user.full_name || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span>{user.email}</span>
                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                            {user.email === SUPER_ADMIN_EMAIL && (
                              <span className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                מנהל ראשי
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.created_date && format(new Date(user.created_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          {isUserApproved(user) ? (
                            <span className="flex items-center text-green-600 justify-end">
                              <CheckCircle className="ml-1 h-4 w-4" />
                              מאושר
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-600 justify-end">
                              <AlertTriangle className="ml-1 h-4 w-4" />
                              ממתין לאישור
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.email !== SUPER_ADMIN_EMAIL && (
                            isUserApproved(user) ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => handleRevokeUser(user)}
                              >
                                <XCircle className="ml-1 h-4 w-4" />
                                ביטול הרשאות
                              </Button>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  onClick={() => handleApproveUser(user)}
                                >
                                  <CheckCircle className="ml-1 h-4 w-4" />
                                  אישור
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  onClick={() => handleRejectUser(user)}
                                >
                                  <BanIcon className="ml-1 h-4 w-4" />
                                  סירוב
                                </Button>
                              </div>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-right">
            <CardTitle>כתובות אימייל מורשות</CardTitle>
            <CardDescription>משתמשים עם כתובות אימייל מהרשימה הזו יקבלו גישה אוטומטית למערכת</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
              </div>
            ) : filteredAllowedEmails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
                <p className="text-lg">לא נמצאו כתובות אימייל מורשות</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">כתובת אימייל</TableHead>
                      <TableHead className="text-right">הערות</TableHead>
                      <TableHead className="text-right">הוזמן על ידי</TableHead>
                      <TableHead className="text-right">תאריך הזמנה</TableHead>
                      <TableHead className="text-center">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllowedEmails.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-right">
                          <div className="flex items-center justify-end">
                            <span>{item.email}</span>
                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.notes ||  '-'}</TableCell>
                        <TableCell className="text-right">{item.invited_by || '-'}</TableCell>
                        <TableCell className="text-right">
                          {item.invited_date && format(new Date(item.invited_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleRemoveAllowedEmail(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end py-4">
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-teal-600 hover:bg-teal-700 text-lg"
            >
              <UserPlus className="ml-2 h-5 w-5" />
              הוספת אימייל
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl">הוספת כתובת אימייל מורשית</DialogTitle>
            <DialogDescription>
              הוספת כתובת אימייל לרשימה תאפשר למשתמש זה לקבל גישה אוטומטית למערכת בעת ההרשמה
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="email" className="text-lg">כתובת אימייל</Label>
              <Input
                id="email"
                placeholder="example@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={!!processingEmail}
                className="text-lg"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2 text-right">
              <Label htmlFor="notes" className="text-lg">הערות (אופציונלי)</Label>
              <Input
                id="notes"
                placeholder="הערות לגבי המשתמש"
                value={emailNotes}
                onChange={(e) => setEmailNotes(e.target.value)}
                disabled={!!processingEmail}
                className="text-lg text-right"
                dir="rtl"
              />
            </div>
          </div>
          
          <DialogFooter className="flex-row-reverse">
            <Button 
              onClick={() => handleAddAllowedEmail(newEmail, emailNotes)}
              disabled={!newEmail || !!processingEmail}
              className="bg-teal-600 hover:bg-teal-700 text-lg"
            >
              {processingEmail ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  מוסיף...
                </>
              ) : (
                <>
                  <UserPlus className="ml-2 h-5 w-5" />
                  הוספה
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={!!processingEmail}
              className="text-lg"
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
