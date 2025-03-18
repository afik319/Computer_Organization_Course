
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lesson, Exam, ExamResult, User } from "@/api/entities";
import { Book, GraduationCap, Trophy, Clock, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalExams: 0,
    examsTaken: 0,
    averageScore: 0
  });
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [courseTitle, setCourseTitle] = useState("ברוכים הבאים לקורס ארגון מחשבים");
  const [courseDescription, setCourseDescription] = useState(`ברוכים הבאים לקורס ארגון מחשבים! תכנית לימודים מקיפה זו מיועדת 
  להעניק לכם הבנה מעמיקה של ארכיטקטורת מחשבים וארגונם. באמצעות
  שיעורי וידאו, תוכן אינטראקטיבי ובחינות מעשיות, תשלטו
  במושגים מרכזיים הכוללים:

  • ארכיטקטורת מעבדים ותכנונם
  • מערכות זיכרון ומטמון
  • ארכיטקטורת סט הוראות
  • צנרת וביצועים
  • מערכות קלט/פלט והיקפיים
  • תכנות בשפת סף

  נווטו בחלק השיעורים כדי לגשת לתוכן הווידאו וחומרי הלימוד,
  ובדקו את הידע שלכם בחלק הבחינות. בהצלחה בלימודים!`);
  
  const [currentUser, setCurrentUser] = useState(null);
  const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

  useEffect(() => {
    async function loadData() {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
      
      const [lessons, exams, results] = await Promise.all([
        Lesson.list(),
        Exam.list(),
        ExamResult.list()
      ]);

      const avgScore = results.length > 0
        ? results.reduce((sum, result) => sum + result.score, 0) / results.length
        : 0;

      setStats({
        totalLessons: lessons.length,
        totalExams: exams.length,
        examsTaken: results.length,
        averageScore: avgScore
      });
    }

    loadData();
  }, []);
  
  const openEditDialog = (field) => {
    setEditingField(field);
    setShowEditDialog(true);
  };
  
  const saveContent = () => {
    setShowEditDialog(false);
    toast({
      title: "התוכן נשמר בהצלחה",
      description: "שינויים שלך בתוכן הקורס נשמרו",
    });
  };
  
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">{courseTitle}</h1>
          {isSuperAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => openEditDialog('title')}
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
              <div className="text-3xl font-bold">{stats.examsTaken}</div>
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
                {stats.averageScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md relative">
          {isSuperAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              className="absolute top-4 left-4 flex items-center gap-2"
              onClick={() => openEditDialog('description')}
            >
              <Edit className="h-4 w-4 ml-1" />
              עריכת תוכן
            </Button>
          )}
          
          <h2 className="text-2xl font-bold text-blue-800 mb-4">על הקורס</h2>
          <div className="text-lg space-y-4">
            <div className="leading-relaxed whitespace-pre-line">
              {courseDescription}
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
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="text-lg text-right"
                  dir="rtl"
                />
              </div>
            ) : (
              <div className="space-y-2 text-right">
                <Label htmlFor="description" className="text-lg">תוכן</Label>
                <Textarea
                  id="description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={10}
                  className="text-lg text-right"
                  dir="rtl"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-row-reverse">
            <Button 
              onClick={saveContent}
              className="bg-teal-600 hover:bg-teal-700 text-lg"
            >
              שמירה
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
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
