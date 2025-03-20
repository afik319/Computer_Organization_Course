import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

// מיפוי מותאם של נושאים לשם תצוגה
const getTopicLabel = (topicId) => {
  try {
    const savedTopics = localStorage.getItem('lessonTopics');
    if (savedTopics) {
      const topics = JSON.parse(savedTopics);
      const topic = topics.find(t => t.id === topicId);
      return topic ? topic.label : topicId;
    }
  } catch (error) {
    console.error("Error getting topic label:", error);
  }
  
  // ברירת מחדל אם לא מצאנו את הנושא או הייתה שגיאה
  return "נושא לא מוגדר";
};

export default function LessonList({ lessons, onSelect, selectedLesson, onEdit }) {
  // נגן על הקריאה ל-map בעזרת ערך ברירת מחדל
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  
  // Log the lessons we received to debug
  console.log("LessonList received lessons:", safeLessons);
  
  // יצירת מיפוי נושאים ייחודיים
  const sortedLessons = safeLessons.slice().sort((a, b) => a.order - b.order);
  const topics = Array.from(new Set(sortedLessons.map(l => l.topic)));

  // Early return if no lessons
  if (safeLessons.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-md p-6 text-center">
        <p className="text-lg text-gray-600">אין שיעורים זמינים כרגע</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-md">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-6">
          {topics.map((topic, topicIndex) => {
            const topicLessons = sortedLessons.filter(l => l.topic === topic);
            return (
              <div key={topic} className="mb-8 last:mb-0">
                <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2 text-right" dir="rtl">
  <span>{`${topicIndex + 1}. ${getTopicLabel(topic)}`}</span>
</h3>

                <div className="space-y-2">
                  {topicLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
                        selectedLesson?.id === lesson.id
                          ? "bg-blue-50 text-blue-800 shadow-sm"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => onSelect(lesson)}
                    >
                      <div className="flex-1 text-right text-lg">
                        {lesson.title}
                      </div>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lesson);
                          }}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
  
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

// מיפוי מותאם של נושאים לשם תצוגה
const getTopicLabel = (topicId) => {
  try {
    const savedTopics = localStorage.getItem('lessonTopics');
    if (savedTopics) {
      const topics = JSON.parse(savedTopics);
      const topic = topics.find(t => t.id === topicId);
      return topic ? topic.label : topicId;
    }
  } catch (error) {
    console.error("Error getting topic label:", error);
  }
  
  // ברירת מחדל אם לא מצאנו את הנושא או הייתה שגיאה
  return "נושא לא מוגדר";
};

export default function LessonList({ lessons, onSelect, selectedLesson, onEdit }) {
  // נגן על הקריאה ל-map בעזרת ערך ברירת מחדל
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  
  // Log the lessons we received to debug
  console.log("LessonList received lessons:", safeLessons);
  
  // יצירת מיפוי נושאים ייחודיים
  const sortedLessons = safeLessons.slice().sort((a, b) => a.order - b.order);
  const topics = Array.from(new Set(sortedLessons.map(l => l.topic)));

  // Early return if no lessons
  if (safeLessons.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-md p-6 text-center">
        <p className="text-lg text-gray-600">אין שיעורים זמינים כרגע</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-md">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-6">
          {topics.map((topic, topicIndex) => {
            const topicLessons = sortedLessons.filter(l => l.topic === topic);
            return (
              <div key={topic} className="mb-8 last:mb-0">
                <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2 text-right" dir="rtl">
  <span>{`${topicIndex + 1}. ${getTopicLabel(topic)}`}</span>
</h3>

                <div className="space-y-2">
                  {topicLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
                        selectedLesson?.id === lesson.id
                          ? "bg-blue-50 text-blue-800 shadow-sm"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => onSelect(lesson)}
                    >
                      <div className="flex-1 text-right text-lg">
                        {lesson.title}
                      </div>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lesson);
                          }}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}