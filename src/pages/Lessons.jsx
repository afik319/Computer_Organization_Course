
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import LessonList from "../components/lessons/LessonList";
import LessonForm from "../components/lessons/LessonForm";
import LessonViewer from "../components/lessons/LessonViewer";
import { User } from "@/api/entities";
import { Lesson } from "@/api/entities";

// Define super admin email directly here too
const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadLessons = async () => {
    try {
      const fetchedLessons = Lesson.getAllLessons();
      
      try {
        const uniqueTopics = [...new Set(fetchedLessons.map(lesson => lesson.topic))];
        
        const savedTopicsString = localStorage.getItem('lessonTopics');
        let savedTopics = [];
        
        if (savedTopicsString) {
          savedTopics = JSON.parse(savedTopicsString);
        } else {
          savedTopics = [
            { id: "topic_1", label: "הקדמה" },
            { id: "topic_2", label: "שיטות לייצוג מספרים" },
            { id: "topic_3", label: "מערכים והקצאת מקום בזיכרון" },
            { id: "topic_4", label: "מעגלים לוגיים" },
            { id: "topic_5", label: "חישוב זמן עיבוד" },
            { id: "topic_6", label: "הקדמה לרגיסטרים" },
            { id: "topic_7", label: "סוגי פקודות שונים" },
            { id: "topic_8", label: "המעבד החד מחזורי" },
            { id: "topic_9", label: "המעבד בתצורת צנרת" },
            { id: "topic_10", label: "זיכרון המטמון" }
          ];
          localStorage.setItem('lessonTopics', JSON.stringify(savedTopics));
        }
        
        const existingTopicIds = savedTopics.map(topic => topic.id);
        const missingTopics = uniqueTopics.filter(topicId => !existingTopicIds.includes(topicId));
        
        if (missingTopics.length > 0) {
          console.log("Found missing topics:", missingTopics);
          
          let highestId = 0;
          savedTopics.forEach(topic => {
            const idMatch = topic.id.match(/topic_(\d+)/);
            if (idMatch && parseInt(idMatch[1]) > highestId) {
              highestId = parseInt(idMatch[1]);
            }
          });
          
          const newTopics = missingTopics.map((topicId, index) => {
            const idMatch = topicId.match(/topic_(\d+)/);
            if (idMatch) {
              return { id: topicId, label: `נושא ${idMatch[1]}` };
            } else {
              return { id: topicId, label: `נושא ${highestId + index + 1}` };
            }
          });
          
          const updatedTopics = [...savedTopics, ...newTopics];
          localStorage.setItem('lessonTopics', JSON.stringify(updatedTopics));
        }
      } catch (error) {
        console.error("Error processing topics:", error);
      }
      
      const sortedLessons = [...fetchedLessons].sort((a, b) => {
        if (a.topic !== b.topic) {
          return a.topic.localeCompare(b.topic);
        }
        const orderA = Number(a.order) || 0;
        const orderB = Number(b.order) || 0;
        
        return orderA - orderB;
      });
      
      setLessons(sortedLessons);
      
      if (sortedLessons.length > 0 && !selectedLesson) {
        setSelectedLesson(sortedLessons[0]);
      }
      
      return sortedLessons;
    } catch (error) {
      console.error("Error loading lessons:", error);
      return [];
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        
        try {
          const user = await User.me();
          setCurrentUser(user);
        } catch (error) {
          console.error("Error getting user:", error);
          setLoading(false);
          return;
        }
        
        await loadLessons();
      } catch (error) {
        console.error("Error initializing lessons page:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initPage();
  }, []);

  const handleSaveLesson = async (lessonData) => {
    try {
      const lessonToSave = {
        ...lessonData,
        order: Number(lessonData.order)
      };
      
      console.log("Saving lesson with order:", lessonToSave.order, typeof lessonToSave.order);
      
      if (lessonToSave.id) {
        await Lesson.update(lessonToSave.id, lessonToSave);
        toast({
          title: "שיעור עודכן",
          description: "השיעור עודכן בהצלחה",
        });
      } else {
        await Lesson.create(lessonToSave);
        toast({
          title: "שיעור נוצר",
          description: "השיעור נוצר בהצלחה",
        });
      }
      
      setShowForm(false);
      
      const updatedLessons = await loadLessons();
      
      if (!lessonToSave.id && updatedLessons.length > 0) {
        const newLesson = updatedLessons.find(l => 
          l.title === lessonToSave.title && l.topic === lessonToSave.topic
        );
        if (newLesson) {
          setSelectedLesson(newLesson);
        }
      } else if (lessonToSave.id) {
        const updatedLesson = updatedLessons.find(l => l.id === lessonToSave.id);
        if (updatedLesson) {
          setSelectedLesson(updatedLesson);
        }
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת השיעור",
        variant: "destructive"
      });
    }
  };

  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setShowForm(true);
  };
  
  const handleDeleteLesson = async (lessonId) => {
    try {
      await Lesson.delete(lessonId);
      
      alert("השיעור נמחק בהצלחה");
      
      await loadLessons();
      
      setSelectedLesson(null);
    } catch (error) {
      alert("Error deleting lesson:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת השיעור",
        variant: "destructive"
      });
    }
  };
  
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  if (loading) {
    return (
      <div className="text-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-lg text-gray-600">טוען שיעורים...</p>
      </div>
    );
  }

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
              className="bg-teal-600 hover:bg-teal-700 text-lg px-6 py-2 text-right flex-row-reverse"
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
              <LessonViewer 
                lesson={selectedLesson} 
                onDelete={isSuperAdmin ? handleDeleteLesson : undefined}
              />
            ) : (
              <div className="text-center p-16 bg-white rounded-lg border shadow-md">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">לא נבחר שיעור</h3>
                <p className="text-lg text-gray-600">
                  {lessons.length > 0 
                    ? "בחרו שיעור מהרשימה כדי להתחיל ללמוד" 
                    : "אין שיעורים זמינים כרגע. אנא בדוק בקרוב."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
