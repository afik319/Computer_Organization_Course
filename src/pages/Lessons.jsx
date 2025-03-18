import React, { useState, useEffect } from "react";
import { Lesson } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LessonList from "../components/lessons/LessonList";
import LessonForm from "../components/lessons/LessonForm";
import LessonViewer from "../components/lessons/LessonViewer";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
    loadLessons();
  }, []);

  const loadLessons = async () => {
    const fetchedLessons = await Lesson.list();
    setLessons(fetchedLessons);
  };

  const handleSaveLesson = async (lessonData) => {
    if (lessonData.id) {
      await Lesson.update(lessonData.id, lessonData);
    } else {
      await Lesson.create(lessonData);
    }
    setShowForm(false);
    loadLessons();
  };

  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setShowForm(true);
  };
  
  // Only super admin can add/edit lessons
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">שיעורי הקורס</h1>
          {isSuperAdmin && (
            <Button 
              onClick={() => {
                setSelectedLesson(null);
                setShowForm(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-lg px-6 py-2"
            >
              <Plus className="w-5 h-5 ml-2" />
              הוספת שיעור
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <LessonList
              lessons={lessons}
              onSelect={setSelectedLesson}
              selectedLesson={selectedLesson}
              onEdit={isSuperAdmin ? handleEditLesson : undefined}
            />
          </div>

          <div className="lg:col-span-8">
            {showForm ? (
              <LessonForm
                lesson={selectedLesson}
                onSave={handleSaveLesson}
                onCancel={() => setShowForm(false)}
              />
            ) : selectedLesson ? (
              <LessonViewer lesson={selectedLesson} />
            ) : (
              <div className="text-center p-16 bg-white rounded-lg border shadow-md">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">לא נבחר שיעור</h3>
                <p className="text-lg text-gray-600">
                  בחרו שיעור מהרשימה כדי להתחיל ללמוד
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}