import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil, CheckCircle2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// פונקציה לתיקון תצוגת שמות הנושאים - מחליפה קו תחתון ברווח
const formatTopicName = (topicName) => {
  if (!topicName) return "";
  return topicName.replace(/_/g, ' ');
};

const TOPICS_MAP = {
  "topic_1": "הקדמה",
  "topic_2": "שיטות לייצוג מספרים",
  "topic_3": "מערכים והקצאת מקום בזיכרון",
  "topic_4": "מעגלים לוגיים",
  "topic_5": "חישוב זמן עיבוד",
  "topic_6": "הקדמה לרגיסטרים",
  "topic_7": "סוגי פקודות שונים",
  "topic_8": "המעבד החד מחזורי",
  "topic_9": "המעבד בתצורת צנרת",
  "topic_10": "זיכרון המטמון"
};

export default function ExamList({ exams, results, onSelect, selectedExam, onEdit, onDelete, onTakeExam, currentUserEmail }) {
  const safeExams = Array.isArray(exams) ? exams : [];
  const safeResults = Array.isArray(results) ? results : [];
  
  // יצירת מפה של תוצאות אחרונות לכל מבחן
  const latestResults = new Map();
  safeResults.forEach(result => {
    if (result.created_by === currentUserEmail) {
      if (!latestResults.has(result.exam_id) || 
          new Date(result.created_date) > new Date(latestResults.get(result.exam_id).created_date)) {
        latestResults.set(result.exam_id, result);
      }
    }
  });

  const topics = Object.keys(TOPICS_MAP).filter(topic => 
    safeExams.some(exam => exam.topic === topic)
  );

  if (safeExams.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-md p-6 text-center">
        <p className="text-lg text-gray-600">אין בחינות זמינות כרגע</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-md">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-6">
          {topics.map(topic => {
            // סינון בחינות לפי נושא
            const topicExams = safeExams.filter(exam => exam.topic === topic);
            // המרת מזהה נושא לשם תצוגה
            const topicName = TOPICS_MAP[topic] || formatTopicName(topic);
            
            return (
              <div key={topic} className="mb-8 last:mb-0">
                <h3 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2 text-right">
                  {topicName}
                </h3>
                <div className="space-y-3">
                  {topicExams.map(exam => {
                    const latestResult = latestResults.get(exam.id);
                    const hasTaken = !!latestResult;
                    const passed = hasTaken && latestResult.score >= exam.passing_score;
                    const best = hasTaken ? latestResult.score : null;
                    
                    return (
                      <div
                        key={exam.id}
                        className={cn(
                          "flex flex-col p-3 rounded-lg transition-all cursor-pointer text-right",
                          selectedExam?.id === exam.id
                            ? "bg-blue-50 text-blue-800 shadow-sm"
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => onSelect(exam)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {onEdit && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-500 hover:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(exam);
                                  }}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-500 hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(exam);
                                  }}
                                >
                                  <Pencil className="h-5 w-5" />
                                </Button>
                              </>
                            )}
                            
                            {!onEdit && hasTaken && (
                              <div className="flex flex-col items-center">
                                <Badge 
                                  className={passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                >
                                  {best}%
                                </Badge>
                                {passed && (
                                  <div className="text-green-600 text-xs mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> עבר
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 mr-4">
                            <div className="font-medium text-lg">{exam.title}</div>
                            <div className="text-gray-600 text-sm mt-1">
                              {exam.questions?.length || 0} שאלות
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}