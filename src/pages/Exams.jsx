
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExamList from "../components/exams/ExamList";
import ExamForm from "../components/exams/ExamForm";
import ExamTaker from "../components/exams/ExamTaker";

// Import entities directly
import { User } from "@/api/entities";
import { Exam } from "@/api/entities";
import { ExamResult } from "@/api/entities";

// Define super admin email directly here too
const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [takingExam, setTakingExam] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examToDelete, setExamToDelete] = useState(null);
  const navigate = useNavigate();

  // Load all exams and results from the database
  const loadData = async () => {
    try {
      console.log("Fetching exams and results...");
      const [fetchedExams, fetchedResults] = await Promise.all([
        Exam.list(),
        ExamResult.list()
      ]);
      
      console.log("Fetched exams:", fetchedExams.length, fetchedExams);
      console.log("Fetched results:", fetchedResults.length, fetchedResults);
      
      // Sort exams by topic
      const sortedExams = [...fetchedExams].sort((a, b) => {
        return a.topic.localeCompare(b.topic);
      });
      
      setExams(sortedExams);
      setResults(fetchedResults);
      
      // Select first exam if available and no exam is selected
      if (sortedExams.length > 0 && !selectedExam) {
        setSelectedExam(sortedExams[0]);
      }
      
      return { exams: sortedExams, results: fetchedResults };
    } catch (error) {
      console.error("Error loading data:", error);
      return { exams: [], results: [] };
    }
  };

  useEffect(() => {
    const initPage = async () =>  {
      try {
        setLoading(true);
        
        // Get current user
        try {
          const user = await User.me();
          setCurrentUser(user);
          console.log("Current user:", user);
        } catch (error) {
          console.error("Error getting user:", error);
          setLoading(false);
          return;
        }
        
        // Load exams and results
        await loadData();
      } catch (error) {
        console.error("Error initializing exams page:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initPage();
  }, []);

  const handleSaveExam = async (examData) => {
    try {
      if (examData.id) {
        await Exam.update(examData.id, examData);
        toast({
          title: "בחינה עודכנה",
          description: "הבחינה עודכנה בהצלחה",
        });
      } else {
        await Exam.create(examData);
        toast({
          title: "בחינה נוצרה",
          description: "הבחינה נוצרה בהצלחה",
        });
      }
      
      setShowForm(false);
      
      // Reload data
      const { exams: updatedExams } = await loadData();
      
      // If we just created a new exam, find and select it
      if (!examData.id && updatedExams.length > 0) {
        const newExam = updatedExams.find(e => 
          e.title === examData.title && e.topic === examData.topic
        );
        if (newExam) {
          setSelectedExam(newExam);
        }
      } else if (examData.id) {
        // If we updated an existing exam, find and select the updated version
        const updatedExam = updatedExams.find(e => e.id === examData.id);
        if (updatedExam) {
          setSelectedExam(updatedExam);
        }
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הבחינה",
        variant: "destructive"
      });
    }
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setShowForm(true);
  };

  const handleDeleteExam = (exam) => {
    setExamToDelete(exam);
  };

  const confirmDeleteExam = async () => {
    try {
      if (!examToDelete) return;
      
      await Exam.delete(examToDelete.id);
      
      toast({
        title: "בחינה נמחקה",
        description: "הבחינה נמחקה בהצלחה",
      });
      
      // If the deleted exam is currently selected, reset the selection
      if (selectedExam && selectedExam.id === examToDelete.id) {
        setSelectedExam(null);
      }
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הבחינה",
        variant: "destructive"
      });
    } finally {
      setExamToDelete(null);
    }
  };

  const handleExamComplete = async (examId, answers, score, closeView = false) => {
    try {
      console.log(`Saving exam result. Exam ID: ${examId}, Score: ${score}%, Answers:`, answers);
      
      await ExamResult.create({
        exam_id: examId,
        answers: answers,
        score: score,
        completed_date: new Date().toISOString(),
        created_by: currentUser.email, // רק אם המשתמש יוצר בעצמו את התוצאה
        is_sample: false
      });
      
      
      toast({
        title: "בחינה הושלמה",
        description: `ציון: ${score}%`,
      });
      
      // Only close the exam view if explicitly requested
      if (closeView) {
        setTakingExam(false);
      }
      
      // Reload data to update results
      await loadData();
    } catch (error) {
      console.error("Error saving exam result:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת תוצאות הבחינה",
        variant: "destructive"
      });
    }
  };
  
  // Only super admin can add/edit exams
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  if (loading) {
    return (
      <div className="text-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-lg text-gray-600">טוען בחינות...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">בחינות</h1>
          {isSuperAdmin && (
            <Button 
              onClick={() => {
                setSelectedExam(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-lg px-4 py-2 text-right flex-row-reverse"
            >
              <Plus className="h-5 w-5 mr-1" />
              יצירת בחינה
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <ExamList
              exams={exams}
              results={results}
              onSelect={setSelectedExam}
              selectedExam={selectedExam}
              onEdit={isSuperAdmin ? handleEditExam : undefined}
              onDelete={isSuperAdmin ? handleDeleteExam : undefined}
              onTakeExam={() => setTakingExam(true)}
              currentUserEmail={currentUser?.email}
            />
          </div>

          <div className="lg:col-span-8">
            {showForm ? (
              <ExamForm
                exam={selectedExam}
                onSave={handleSaveExam}
                onCancel={() => setShowForm(false)}
              />
            ) : takingExam && selectedExam ? (
              <ExamTaker
                exam={selectedExam}
                onComplete={handleExamComplete}
                onCancel={() => setTakingExam(false)}
              />
            ) : selectedExam ? (
              <div className="bg-white p-8 rounded-lg border shadow-md text-right">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">{selectedExam.title}</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">{selectedExam.description}</p>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {selectedExam.questions?.length} שאלות
                    </p>
                    <p className="text-lg font-medium text-gray-700">
                      ציון עובר: {selectedExam.passing_score}%
                    </p>
                  </div>
                  {!isSuperAdmin && (
                    <Button 
                      onClick={() => setTakingExam(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-lg px-6 py-3"
                    >
                      התחל בחינה
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-16 bg-white rounded-lg border shadow-md">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">לא נבחרה בחינה</h3>
                <p className="text-lg text-gray-600">
                  {exams.length > 0 
                    ? "בחרו בחינה מהרשימה כדי לצפות בפרטים או להתחיל" 
                    : "אין בחינות זמינות כרגע. אנא בדוק בקרוב."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק בחינה זו?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק לצמיתות את הבחינה ואת כל השאלות שלה.
              לא ניתן לשחזר את המידע לאחר המחיקה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse justify-start">
            <AlertDialogAction
              onClick={confirmDeleteExam}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              כן, מחק
            </AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
