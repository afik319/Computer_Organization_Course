import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function LessonViewer({ lesson }) {
  if (!lesson) return null;

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-blue-800">{lesson.title}</h2>
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">{lesson.description}</p>

        {lesson.video_url && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <video
              controls
              className="w-full rounded-lg"
              src={lesson.video_url}
            >
              הדפדפן שלך אינו תומך בתגית וידאו.
            </video>
          </div>
        )}

        {lesson.attachments && lesson.attachments.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-800">קבצים מצורפים</h3>
            <div className="grid gap-3">
              {lesson.attachments.map((attachment, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start bg-white hover:bg-blue-50 text-lg p-4 border-gray-200 shadow-sm"
                  asChild
                >
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <FileText className="ml-3 h-5 w-5 text-blue-800" />
                    <span className="flex-1">{attachment.title}</span>
                    <Download className="h-5 w-5 text-teal-600" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}