
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, GraduationCap, Trophy, Clock, Edit, Loader2, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/api/entities";
import { RegisteredUser } from "@/api/entities";
import { Lesson } from "@/api/entities";
import { Exam } from "@/api/entities";
import { ExamResult } from "@/api/entities";
import { CourseContent } from "@/api/entities";

const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalExams: 0,
    examsTaken: 0,
    averageScore: 0,
    totalUsers: 0,
    availableExams: 0
  });
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setDataLoading(true);
      console.log("Starting to load dashboard data...");
      
      const user = await User.me();
      setCurrentUser(user);
      console.log("Current user:", user);

      if (user && user.email && user.email !== SUPER_ADMIN_EMAIL) {
        const allUsers = await RegisteredUser.filter({ status: "approved" }); //filter by mail not possible
        const registeredUsers = allUsers.filter(u => 
          u.email.toLowerCase() === user.email.toLowerCase()
        );
        
        if (registeredUsers.length === 0) {
          console.log("User doesn't have dashboard access");
          setDataLoading(false);
          return;
        }
      }

      const [courseContents, exams, examResults] = await Promise.all([
        CourseContent.list(),
        Exam.list(),
        ExamResult.list()
    ]);
    
    // טוען את השיעורים מה-JSON במקום מה-API
    const lessons = Lesson.getAllLessons();
    
      if (courseContents && courseContents.length > 0) {
        setCourseContent(courseContents[0]);
      }

      const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
      
      if (isSuperAdmin) {
        const users = await RegisteredUser.filter({ status: "approved" });
        console.log("Admin - Approved users:", users.length);
        
        const uniqueUsers = new Map();
        for (const user of users) {
          const existingUser = uniqueUsers.get(user.email);
          if (!existingUser || new Date(user.created_date) > new Date(existingUser.created_date)) {
            uniqueUsers.set(user.email, user);
          }
        }
        const uniqueUserList = Array.from(uniqueUsers.values());
        console.log("Admin - Unique approved users:", uniqueUserList.length);
        
        setStats({
          totalLessons: lessons.length,
          totalExams: exams.length,
          totalUsers: uniqueUserList.length
        });
      } else {
        console.log("Calculating stats for regular user:", user.email);
        
        // בדיקה שהמבחן עדיין קיים במערכת על ידי יצירת מפה של מזהי המבחנים הקיימים
        const availableExamIds = new Set(exams.map(exam => exam.id));
        
        // סינון תוצאות המבחנים רק למשתמש הנוכחי ולמבחנים שעדיין קיימים במערכת
        const userResults = examResults.filter(result => 
          result.created_by === user.email && 
          availableExamIds.has(result.exam_id)
        );
        
        console.log("User exam results (only available exams):", userResults.length, userResults);
        
        // מציאת התוצאה האחרונה לכל מבחן (עבור מבחנים שהושלמו יותר מפעם אחת)
        const latestResultsMap = new Map();
        for (const result of userResults) {
          if (!latestResultsMap.has(result.exam_id) || 
              new Date(result.created_date) > new Date(latestResultsMap.get(result.exam_id).created_date)) {
            latestResultsMap.set(result.exam_id, result);
          }
        }
        
        const userUniqueExams = Array.from(latestResultsMap.values());
        console.log("User unique completed exams:", userUniqueExams.length);
        
        let totalScore = 0;
        for (const result of userUniqueExams) {
          if (typeof result.score === 'number') {
            totalScore += result.score;
          }
        }
        
        const averageScore = userUniqueExams.length > 0 
          ? totalScore / userUniqueExams.length 
          : 0;
        
        console.log("User stats:", {
          totalLessons: lessons.length,
          totalExams: exams.length,
          examsTaken: userUniqueExams.length,
          totalAvailableExams: exams.length,
          averageScore,
          totalScore
        });

        setStats({
          totalLessons: lessons.length,
          totalExams: exams.length,
          examsTaken: userUniqueExams.length,
          availableExams: exams.length,
          averageScore: averageScore
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בטעינת הנתונים, אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveContent = async () => {
    try {
      setIsLoading(true);

      const contentData = {
        title: editingField === 'title' ? courseContent.title : courseContent?.title,
        description: editingField === 'description' ? courseContent.description : courseContent?.description,
        last_updated: new Date().toISOString(),
        updated_by: currentUser?.email || "system"
      };
      
      if (courseContent?.id) {
        const updatedContent = await CourseContent.update(courseContent.id, contentData);
        setCourseContent(updatedContent);

      } else {
        const newContent = await CourseContent.create({
            title: contentData.title || "כותרת ברירת מחדל",
            description: contentData.description || "תיאור ברירת מחדל",
            last_updated: new Date().toISOString(),
            updated_by: currentUser?.email || "system",
            created_by: currentUser?.email || "system",
            is_sample: false
        });
        setCourseContent(newContent);
      }
      
      setShowEditDialog(false);
      
      toast({
        title: "התוכן נשמר בהצלחה",
        description: "שינויים שלך בתוכן הקורס נשמרו",
      });

      loadData();
      
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "שגיאה בשמירת התוכן",
        description: "אירעה שגיאה בשמירת השינויים",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            {courseContent?.title || "ברוכים הבאים לקורס ארגון מחשבים"}
          </h1>
          {isSuperAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                setEditingField('title');
                setCourseContent(prev => ({
                  ...prev,
                  title: prev?.title || ""
                }));
                setShowEditDialog(true);
              }}
            >
              <Edit className="h-4 w-4 ml-1" />
              עריכת כותרת
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-l from-blue-700 to-blue-900 text-white">
              <CardTitle className="text-lg font-medium">
                סה״כ שיעורים
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Book className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.totalLessons}</div>
              <div className="mt-2">
                <Link to={createPageUrl("Lessons")}>
                  <Button variant="link" className="text-blue-600 -m-2 -mr-3 text-lg">
                    צפייה בשיעורים &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-l from-teal-700 to-teal-900 text-white">
              <CardTitle className="text-lg font-medium">
                בחינות זמינות
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.totalExams}</div>
              <div className="mt-2">
                <Link to={createPageUrl("Exams")}>
                  <Button variant="link" className="text-teal-600 -m-2 -mr-3 text-lg">
                    צפייה בבחינות &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {!isSuperAdmin && (
            <>
              <Card className="border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-l from-purple-700 to-purple-900 text-white">
                  <CardTitle className="text-lg font-medium">
                    בחינות שהושלמו
                  </CardTitle>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">
                    {stats.examsTaken}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-l from-amber-600 to-amber-800 text-white">
                  <CardTitle className="text-lg font-medium">
                    ציון ממוצע
                  </CardTitle>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">
                    {stats.examsTaken > 0 ? stats.averageScore.toFixed(1) : "--"}%
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {isSuperAdmin && (
            <Card className="border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-l from-green-600 to-green-800 text-white">
                <CardTitle className="text-lg font-medium">
                  סה״כ משתמשים
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <div className="mt-2">
                  <Link to={createPageUrl("UserManagement")}>
                    <Button variant="link" className="text-green-600 -m-2 -mr-3 text-lg">
                      ניהול משתמשים &rarr;
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md relative">
          {isSuperAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              className="absolute top-4 left-4 flex items-center gap-2"
              onClick={() => {
                setEditingField('description');
                setCourseContent(prev => ({
                  ...prev,
                  description: prev?.description || ""
                }));
                setShowEditDialog(true);
              }}
            >
              <Edit className="h-4 w-4 ml-1" />
              עריכת תוכן
            </Button>
          )}
          
          <h2 className="text-2xl font-bold text-blue-800 mb-4">על הקורס</h2>
          <div className="text-lg space-y-4">
            <div className="leading-relaxed whitespace-pre-line">
              {courseContent?.description || "ברוכים הבאים לקורס ארגון מחשבים! כאן יופיע תוכן מפורט על הקורס."}
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl">
              {editingField === 'title' ? 'עריכת כותרת הקורס' : 'עריכת תוכן הקורס'}
            </DialogTitle>
            <DialogDescription>
              ערוך את התוכן בהתאם לצרכיך
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingField === 'title' ? (
              <div className="space-y-2 text-right">
                <Label htmlFor="title" className="text-lg">כותרת</Label>
                <Input
                  id="title"
                  value={courseContent?.title || ""}
                  onChange={(e) => setCourseContent(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="text-lg text-right"
                  dir="rtl"
                />
              </div>
            ) : (
              <div className="space-y-2 text-right">
                <Label htmlFor="description" className="text-lg">תוכן</Label>
                <Textarea
                  id="description"
                  value={courseContent?.description || ""}
                  onChange={(e) => setCourseContent(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={10}
                  className="text-lg text-right"
                  dir="rtl"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-row-reverse justify-between mt-4">
            <Button 
              onClick={saveContent}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                "שמירה"
              )}
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="text-lg"
                disabled={isLoading}
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
