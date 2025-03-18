import React, { useState, useEffect } from "react";
import { Exam, ExamResult } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExamList from "../components/exams/ExamList";
import ExamForm from "../components/exams/ExamForm";
import ExamTaker from "../components/exams/ExamTaker";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [takingExam, setTakingExam] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
    loadExams();
    loadResults();
  }, []);

  const loadExams = async () => {
    const fetchedExams = await Exam.list();
    setExams(fetchedExams);
  };

  const loadResults = async () => {
    const fetchedResults = await ExamResult.list();
    setResults(fetchedResults);
  };

  const handleSaveExam = async (examData) => {
    if (examData.id) {
      await Exam.update(examData.id, examData);
    } else {
      await Exam.create(examData);
    }
    setShowForm(false);
    loadExams();
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setShowForm(true);
  };

  const handleExamComplete = async (examId, answers, score) => {
    await ExamResult.create({
      exam_id: examId,
      answers,
      score,
      completed_date: new Date().toISOString()
    });
    setTakingExam(false);
    loadResults();
  };
  
  // Only super admin can add/edit exams
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

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
              onTakeExam={() => setTakingExam(true)}
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
              <div className="bg-white p-8 rounded-lg border shadow-md">
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
                  בחרו בחינה מהרשימה כדי לצפות בפרטים או להתחיל
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}