import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
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

export default function LessonList({ lessons, onSelect, selectedLesson, onEdit }) {
  const topics = Array.from(new Set(lessons.map(l => l.topic)));

  return (
    <div className="bg-white rounded-lg border shadow-md">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-6">
          {topics.map(topic => {
            const topicLessons = lessons.filter(l => l.topic === topic);
            return (
              <div key={topic} className="mb-8 last:mb-0">
                <h3 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">
                  {TOPICS_MAP[topic] || topic}
                </h3>
                <div className="space-y-2">
                  {topicLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-all",
                        selectedLesson?.id === lesson.id
                          ? "bg-blue-50 text-blue-800 shadow-sm"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <button
                        className="flex-1 text-right text-lg"
                        onClick={() => onSelect(lesson)}
                      >
                        {lesson.title}
                      </button>
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