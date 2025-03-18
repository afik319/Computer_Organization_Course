import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOPICS_MAP = {
  "processor_architecture": "ארכיטקטורת מעבדים",
  "memory_systems": "מערכות זיכרון",
  "instruction_sets": "סט הוראות",
  "pipelining": "שיטות צנרת",
  "cache": "זיכרון מטמון",
  "io_systems": "מערכות קלט/פלט",
  "assembly_language": "שפת סף",
  "performance_optimization": "אופטימיזציית ביצועים"
};

export default function ExamList({ exams, results, onSelect, selectedExam, onEdit, onTakeExam }) {
  const getExamResult = (examId) => {
    return results.find(r => r.exam_id === examId);
  };

  const topics = Array.from(new Set(exams.map(e => e.topic)));

  return (
    <div className="bg-white rounded-lg border shadow-md">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-6">
          {topics.map(topic => {
            const topicExams = exams.filter(e => e.topic === topic);
            return (
              <div key={topic} className="mb-8 last:mb-0">
                <h3 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">
                  {TOPICS_MAP[topic] || topic}
                </h3>
                <div className="space-y-2">
                  {topicExams.map(exam => {
                    const result = getExamResult(exam.id);
                    return (
                      <div
                        key={exam.id}
                        className={cn(
                          "flex items-center p-3 rounded-lg transition-all",
                          selectedExam?.id === exam.id
                            ? "bg-blue-50 text-blue-800 shadow-sm"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <button
                          className="flex-1 text-right flex items-center gap-2 text-lg"
                          onClick={() => onSelect(exam)}
                        >
                          <span>{exam.title}</span>
                          {result && (
                            <Badge
                              variant={result.score >= exam.passing_score ? "success" : "destructive"}
                              className={`mr-2 px-3 py-1 text-sm ${
                                result.score >= exam.passing_score ? 
                                'bg-green-100 text-green-800 hover:bg-green-200' : 
                                'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {result.score}%
                            </Badge>
                          )}
                        </button>
                        <div className="flex items-center gap-2">
                          {onEdit ? (
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
                          ) : !result && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 px-4 py-2 text-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTakeExam(exam);
                              }}
                            >
                              התחל בחינה
                            </Button>
                          )}
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