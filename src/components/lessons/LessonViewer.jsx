import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
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

export default function LessonViewer({ lesson, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!lesson) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-bold text-gray-700 mb-3">לא נבחר שיעור</h3>
        <p className="text-gray-600">אנא בחרו שיעור מהרשימה</p>
      </div>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-blue-800 text-white rounded-t-lg py-6">
          <CardTitle className="text-2xl font-bold text-right">{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {lesson.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
              <video
                controls
                className="w-full h-full"
                src={lesson.video_url}
                poster="/video-placeholder.png"
              >
                הדפדפן שלך לא תומך בתג וידאו.
              </video>
            </div>
          )}

          <div className="space-y-4">
            <div 
              className="prose prose-blue max-w-none text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lesson.description || 'אין תיאור לשיעור זה.' }}
            />
          </div>

          {Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">קבצים מצורפים</h3>
              <div className="space-y-3">
                {lesson.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-medium">{attachment.title}</span>
                    </div>
                    <a 
                      href={attachment.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        הורדה
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        {onDelete && (
          <CardFooter className="p-6 border-t bg-gray-50">
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              מחיקת שיעור
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק שיעור זה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק לצמיתות את השיעור ואת כל תוכנו, כולל וידאו וקבצים מצורפים.
              לא ניתן לשחזר את המידע לאחר המחיקה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse justify-start">
            <AlertDialogAction
              onClick={() => onDelete(lesson.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              כן, מחק
            </AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}