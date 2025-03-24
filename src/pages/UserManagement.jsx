import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { RegisteredUser } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import storage from "../storage";
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
  Search, 
  Mail, 
  RefreshCcw,
  Loader2,
  UserCircle2,
  Ban,
  UserCheck,
  UserX,
  Clock,
  UserPlus,
  Filter,
  TabletSmartphone
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define super admin email directly
const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userNotes, setUserNotes] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserStatus, setNewUserStatus] = useState("pending");
  const navigate = useNavigate();
  
  const checkUserPermissions = useCallback(async () => {
    try {
      const user = await User.me();
      
      if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        navigate(createPageUrl("Dashboard"));
        return false;
      }
      return true;
    } 
    catch (error) {
      console.error("Error checking permission:", error);
      navigate(createPageUrl("Dashboard"));
      return false;
    }
  }, [navigate]);
  
  const loadData = useCallback(async () => {
    if (!(await checkUserPermissions())) 
      return;
    
    setIsLoading(true);
    try {
      // Get all registered users
      const registeredUsers = await RegisteredUser.list();
      
      // Use a map to keep only the latest entry for each email
      const uniqueUsers = new Map();
      
      for (const user of registeredUsers) {
        const existingUser = uniqueUsers.get(user.email);
        
        // If no entry for this email yet, or this is a newer record
        if (!existingUser || new Date(user.created_date) > new Date(existingUser.created_date)) {
          uniqueUsers.set(user.email, user);
        }
      }
      
      // Convert the map values back to an array
      const uniqueRegisteredUsers = Array.from(uniqueUsers.values());
      
      // Sort users by status (pending first) and then by date
      uniqueRegisteredUsers.sort((a, b) => {
        // Admin always first
        if (a.email === SUPER_ADMIN_EMAIL) return -1;
        if (b.email === SUPER_ADMIN_EMAIL) return 1;
        
        // Pending requests first
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        
        // Sort by date (newest first)
        return new Date(b.created_date) - new Date(a.created_date);
      });
      
      setUsers(uniqueRegisteredUsers);
      
    } 
    catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בטעינת רשימת המשתמשים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkUserPermissions]);
  
  useEffect(() => {
    //console.error("USER OBJECT:", User);
    loadData();
  }, [loadData]);

  const handleRefreshData = () => {
    loadData();
  };

  const handleDeleteUser = async (userId, email) => {
    if (email === SUPER_ADMIN_EMAIL) {
      toast({
        title: "פעולה לא אפשרית",
        description: "לא ניתן למחוק משתמש מנהל ראשי",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await RegisteredUser.remove(userId);
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "משתמש הוסר",
        description: "המשתמש הוסר בהצלחה מהמערכת",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "שגיאה במחיקת משתמש",
        description: "אירעה שגיאה בהסרת המשתמש",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveUser = async (user) => {
      try {
        // const allUsers = storage.get("users") || [];
    
        // // עדכון הסטטוס של המשתמש למאושר
        // const updatedUsers = allUsers.map(u =>
        //   u.email === user.email ? { ...u, status: "approved", approval_date: new Date().toISOString() } : u
        // );
    
        // storage.set("users", updatedUsers);
        // setUsers(updatedUsers);

           // מעדכן את הסטטוס ל־approved ב־RegisteredUser (ששומר תחת "registeredUsers")
        await RegisteredUser.update(user.id, {
          status: "approved",
          approval_date: new Date().toISOString(),
        });

        // טוען מחדש את הרשימה מ־RegisteredUser.list() ומעדכן state
        await loadData();

        toast({
          title: "בקשה אושרה",
          description: `בקשת הגישה של ${user.email} אושרה בהצלחה`,
        });
    
      } catch (error) {
        console.error("Error approving user:", error);
        toast({
          title: "שגיאה באישור משתמש",
          description: "אירעה שגיאה באישור בקשת המשתמש",
          variant: "destructive"
        });
      }
    };
    
    
    const handleRejectUser = async (user) => {
      try {
        // const allUsers = storage.get("users") || [];
    
        // // הסרת המשתמש מהרשימה
        // const updatedUsers = allUsers.filter(u => u.email !== user.email);
    
        // storage.set("users", updatedUsers);
        // setUsers(updatedUsers);
        
           // אפשרות 1: למחוק לגמרי
        await RegisteredUser.remove(user.id);

        // רענון הרשימה מתוך RegisteredUser.list()
        await loadData();

        toast({
          title: "בקשה נדחתה",
          description: `בקשת הגישה של ${user.email} נדחתה`,
        });
    
      } catch (error) {
        console.error("Error rejecting user:", error);
        toast({
          title: "שגיאה בדחיית משתמש",
          description: "אירעה שגיאה בדחיית בקשת המשתמש",
          variant: "destructive"
        });
      }
    };
  
  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "שגיאה בהוספת משתמש",
        description: "יש להזין כתובת אימייל",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user already exists
    const emailExists = users.some(user => 
      user.email.toLowerCase() === newUserEmail.toLowerCase()
    );
    
    if (emailExists) {
      toast({
        title: "שגיאה בהוספת משתמש",
        description: "משתמש עם כתובת אימייל זו כבר קיים במערכת",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const currentDate = new Date().toISOString();
      const userData = {
        email: newUserEmail.trim(),
        full_name: newUserName.trim() || "",
        status: newUserStatus,
        request_date: currentDate
      };
      
      // If directly approved, set approval date
      if (newUserStatus === "approved") {
        userData.approval_date = currentDate;
      }
      
      const newUser = await RegisteredUser.create(userData);
      
      setUsers([newUser, ...users]);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserStatus("pending");
      setShowAddDialog(false);
      
      toast({
        title: "משתמש נוסף בהצלחה",
        description: "המשתמש נוסף למערכת",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "שגיאה בהוספת משתמש",
        description: "אירעה שגיאה בהוספת המשתמש",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateNotes = async () => {
    if (!selectedUser) return;
    
    try {
      await RegisteredUser.update(selectedUser.id, {
        ...selectedUser,
        notes: userNotes
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? {...u, notes: userNotes} : u
      ));
      
      setShowNotesDialog(false);
      
      toast({
        title: "הערות עודכנו",
        description: "הערות המשתמש עודכנו בהצלחה",
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "שגיאה בעדכון הערות",
        description: "אירעה שגיאה בעדכון הערות המשתמש",
        variant: "destructive"
      });
    }
  };

  const openNotesDialog = (user) => {
    setSelectedUser(user);
    setUserNotes(user.notes || "");
    setShowNotesDialog(true);
  };

  // Filter users based on search query and status filter
  const filteredUsers = users.filter(user => {
    // Text search
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "pending" && user.status === "pending") ||
      (statusFilter === "approved" && user.status === "approved") ||
      (statusFilter === "rejected" && user.status === "rejected");
    
    return matchesSearch && matchesStatus;
  });
  
  // Get counts for each status
  const pendingCount = users.filter(user => user.status === "pending").length;
  const approvedCount = users.filter(user => user.status === "approved").length;
  const rejectedCount = users.filter(user => user.status === "rejected").length;

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 px-2 py-1">ממתין לאישור</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 px-2 py-1">מאושר</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 px-2 py-1">נדחה</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 px-2 py-1">לא ידוע</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <div className="sticky top-20 bg-gray-50 z-10 pb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">ניהול הרשאות משתמשים</h1>
          <div className="flex gap-2">
            <Button 
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
              onClick={() => setShowAddDialog(true)}
            >
              <UserPlus className="w-4 h-4 ml-2" />
              הוספת משתמש
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleRefreshData}
            >
              <RefreshCcw className="w-4 h-4 ml-2" />
              רענון נתונים
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="חיפוש לפי שם או אימייל..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 w-full text-base text-right"
              dir="rtl"
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-[180px]">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="סינון לפי סטטוס" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">הכל ({users.length})</SelectItem>
                <SelectItem value="pending">ממתין לאישור ({pendingCount})</SelectItem>
                <SelectItem value="approved">מאושר ({approvedCount})</SelectItem>
                <SelectItem value="rejected">נדחה ({rejectedCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="text-base" onClick={() => setStatusFilter("all")}>
            הכל
            <Badge className="mr-2 bg-gray-100 text-gray-800">{users.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-base" onClick={() => setStatusFilter("pending")}>
            בקשות חדשות
            <Badge className="mr-2 bg-amber-100 text-amber-800">{pendingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-base" onClick={() => setStatusFilter("approved")}>
            משתמשים מאושרים
            <Badge className="mr-2 bg-green-100 text-green-800">{approvedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-base" onClick={() => setStatusFilter("rejected")}>
            בקשות שנדחו
            <Badge className="mr-2 bg-red-100 text-red-800">{rejectedCount}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>רשימת משתמשים</CardTitle>
              <CardDescription>ניהול הרשאות משתמשים במערכת ({filteredUsers.length})</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-lg">לא נמצאו משתמשים</p>
                  <p className="text-sm text-gray-400">נסה לשנות את הסינון או החיפוש</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">שם מלא</TableHead>
                        <TableHead className="text-right">אימייל</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">תאריך בקשה</TableHead>
                        <TableHead className="text-center">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-right">
                            {user.full_name || '-'}
                            {user.email === SUPER_ADMIN_EMAIL && (
                              <Badge className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs">
                                מנהל ראשי
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span dir="ltr">{user.email}</span>
                              <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-600">
                            {user.request_date ? (
                              <div className="flex items-center justify-end gap-1">
                                <Clock className="h-3 w-3" />
                                <time>
                                  {format(new Date(user.request_date), 'PPp', { locale: he })}
                                </time>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Notes button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => openNotesDialog(user)}
                                title="הערות"
                              >
                                <TabletSmartphone className="h-4 w-4" />
                              </Button>
                              
                              {/* Approve button - show only for pending users */}
                              {user.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  onClick={() => handleApproveUser(user)}
                                  title="אישור"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Reject button - show only for pending users */}
                              {user.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                  onClick={() => handleRejectUser(user)}
                                  title="דחייה"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Delete user button */}
                              {user.email !== SUPER_ADMIN_EMAIL && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  title="מחיקה"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle>בקשות ממתינות לאישור</CardTitle>
              <CardDescription>בקשות גישה חדשות הממתינות לאישור ({pendingCount})</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-lg">אין בקשות ממתינות</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map(user => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <UserCircle2 className="h-5 w-5 text-amber-600" />
                              <h3 className="font-bold text-lg">{user.full_name || user.email}</h3>
                              {getStatusBadge(user.status)}
                            </div>
                            <div className="text-gray-600 flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span dir="ltr">{user.email}</span>
                            </div>
                            <div className="text-gray-500 text-sm">
                              <strong>תאריך בקשה:</strong> {user.request_date ? format(new Date(user.request_date), 'PPp', { locale: he }) : '-'}
                            </div>
                            {user.notes && (
                              <div className="mt-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                                <strong>הערות:</strong> {user.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-row md:flex-col gap-2 self-center md:self-start shrink-0 w-full md:w-auto">
                            <Button
                              onClick={() => handleApproveUser(user)}
                              className="bg-green-600 hover:bg-green-700 flex-1 md:w-full"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              אישור
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectUser(user)}
                              className="border-amber-500 text-amber-700 hover:bg-amber-50 flex-1 md:w-full"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              דחייה
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => openNotesDialog(user)}
                              className="text-gray-600 hover:text-gray-800 flex-1 md:w-full"
                            >
                              <TabletSmartphone className="mr-2 h-4 w-4" />
                              הערות
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-0">
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle>משתמשים מאושרים</CardTitle>
              <CardDescription>משתמשים בעלי הרשאות גישה למערכת ({approvedCount})</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-lg">אין משתמשים מאושרים</p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredUsers.map(user => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{user.full_name || '-'}</CardTitle>
                          {getStatusBadge(user.status)}
                        </div>
                        <CardDescription dir="ltr">{user.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 text-sm">
                        <div><strong>אושר בתאריך:</strong> {user.approval_date ? format(new Date(user.approval_date), 'PP', { locale: he }) : '-'}</div>
                        {user.notes && (
                          <div className="mt-2 truncate">
                            <strong>הערות:</strong> {user.notes}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openNotesDialog(user)}
                          className="text-green-600"
                        >
                          <TabletSmartphone className="mr-2 h-4 w-4" />
                          הערות
                        </Button>
                        {user.email !== SUPER_ADMIN_EMAIL && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            הסרת גישה
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-0">
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle>בקשות שנדחו</CardTitle>
              <CardDescription>בקשות גישה שנדחו ע"י המנהל ({rejectedCount})</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserX className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-lg">אין בקשות שנדחו</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.full_name || '-'}</span>
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="text-gray-600 text-sm">{user.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveUser(user)}
                          className="text-green-600 border-green-200"
                        >
                          <UserCheck className="mr-1 h-4 w-4" />
                          אישור מחדש
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl">הוספת משתמש חדש</DialogTitle>
            <DialogDescription>
              הוסף משתמש חדש למערכת
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="email" className="text-lg">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="text-lg"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2 text-right">
              <Label htmlFor="name" className="text-lg">שם מלא (אופציונלי)</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="ישראל ישראלי"
                className="text-lg text-right"
                dir="rtl"
              />
            </div>
            
            <div className="space-y-2 text-right">
              <Label htmlFor="status" className="text-lg">סטטוס</Label>
              <Select
                value={newUserStatus}
                onValueChange={setNewUserStatus}
              >
                <SelectTrigger id="status" className="text-right">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="pending">ממתין לאישור</SelectItem>
                  <SelectItem value="approved">מאושר</SelectItem>
                  <SelectItem value="rejected">נדחה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex flex-row-reverse justify-between mt-4">
            <Button 
              onClick={handleAddUser}
              className="bg-teal-600 hover:bg-teal-700 text-lg"
            >
              הוספה
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="text-lg"
              >
                ביטול
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl">הערות למשתמש</DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="notes" className="text-lg">הערות פנימיות</Label>
              <Textarea
                id="notes"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="רשום כאן הערות פנימיות על המשתמש..."
                className="text-lg text-right"
                dir="rtl"
                rows={5}
              />
              <p className="text-gray-500 text-sm">הערות אלו לא יוצגו למשתמש ונועדו לשימוש פנימי בלבד</p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-row-reverse justify-between mt-4">
            <Button 
              onClick={handleUpdateNotes}
              className="bg-teal-600 hover:bg-teal-700 text-base"
            >
              שמירת הערות
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="text-base"
              >
                ביטול
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}