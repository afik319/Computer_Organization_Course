
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HardDrive, FileText, Video, Image, FileBadge, FileQuestion, Users } from "lucide-react";
import { User } from "@/api/entities";
import { Lesson } from "@/api/entities";
import { Exam } from "@/api/entities";
import { ExamResult } from "@/api/entities";
import { CourseContent } from "@/api/entities";
import { RegisteredUser } from "@/api/entities";
import { useUser } from "@/context/UserContext";

const SUPER_ADMIN_EMAIL = "afik.ratzon@gmail.com";

export default function StorageInfo() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, setCurrentUser } = useUser();

  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        setIsLoading(true);       
        const user = await User.me();
      if (!user) 
        console.log('User not found or no email in query param');
      setCurrentUser(user);
      
      // Check if user is admin
      if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        setIsLoading(false);
        return;
      }

      // Load all data to calculate size
      const lessons = Lesson.getAllLessons(); // טוען מה-JSON במקום מה-API
      const [exams, examResults, courseContents, registeredUsers] = await Promise.all([
        Exam.list(),
        ExamResult.list(),
        CourseContent.list(),
        RegisteredUser.list()
      ]);


        // Count attachments and videos
        let videoCount = 0;
        let attachmentCount = 0;
        let videoUrls = new Set();
        let attachmentUrls = new Set();

        // Parse lessons for attachments and videos
        lessons.forEach(lesson => {
          if (lesson.video_url) {
            videoUrls.add(lesson.video_url);
            videoCount++;
          }
          
          if (Array.isArray(lesson.attachments)) {
            lesson.attachments.forEach(attachment => {
              if (attachment.file_url) {
                attachmentUrls.add(attachment.file_url);
                attachmentCount++;
              }
            });
          }
        });

        // Calculate JSON data size (rough estimate)
        const lessonsSize = JSON.stringify(lessons).length / 1024; // KB
        const examsSize = JSON.stringify(exams).length / 1024; // KB
        const resultsSize = JSON.stringify(examResults).length / 1024; // KB
        const contentSize = JSON.stringify(courseContents).length / 1024; // KB
        const usersSize = JSON.stringify(registeredUsers).length / 1024; // KB
        
        const totalDataSize = lessonsSize + examsSize + resultsSize + contentSize + usersSize;
        
        // Estimate file sizes (rough estimate based on typical file sizes)
        const estimatedVideoSize = videoCount * 50; // MB (average video size)
        const estimatedAttachmentSize = attachmentCount * 5; // MB (average attachment size)
        const totalFileSize = estimatedVideoSize + estimatedAttachmentSize;

        setStorageInfo({
          records: {
            lessons: lessons.length,
            exams: exams.length,
            examResults: examResults.length,
            courseContents: courseContents.length,
            registeredUsers: registeredUsers.length,
          },
          files: {
            videos: videoCount,
            attachments: attachmentCount,
            uniqueVideoUrls: videoUrls.size,
            uniqueAttachmentUrls: attachmentUrls.size,
          },
          size: {
            dataSize: totalDataSize.toFixed(2), // KB
            estimatedVideoSize: estimatedVideoSize.toFixed(2), // MB
            estimatedAttachmentSize: estimatedAttachmentSize.toFixed(2), // MB
            totalEstimatedSize: (totalDataSize / 1024 + totalFileSize).toFixed(2), // MB
          }
        });
      } catch (error) {
        console.log("Error loading storage info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageInfo();
  }, []);

  // If user is not admin, show access denied
  if (!isLoading && currentUser?.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-12">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-red-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">גישה נדחתה</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-xl text-center">רק למנהל המערכת יש גישה לדף זה</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">טוען נתוני אחסון...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 mt-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">ניהול אחסון</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-blue-800 text-white rounded-t-lg pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              סה״כ אחסון משוער
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-blue-900">{storageInfo.size.totalEstimatedSize} MB</p>
            <p className="text-sm text-gray-500 mt-1">מבוסס על אומדן של גודל הקבצים השמורים</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-teal-700 text-white rounded-t-lg pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Video className="h-5 w-5" />
              וידאו
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-teal-900">{storageInfo.size.estimatedVideoSize} MB</p>
            <p className="text-sm text-gray-500 mt-1">{storageInfo.files.videos} וידאו ({storageInfo.files.uniqueVideoUrls} ייחודיים)</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-purple-700 text-white rounded-t-lg pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              קבצים מצורפים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-purple-900">{storageInfo.size.estimatedAttachmentSize} MB</p>
            <p className="text-sm text-gray-500 mt-1">{storageInfo.files.attachments} קבצים ({storageInfo.files.uniqueAttachmentUrls} ייחודיים)</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gray-100 rounded-t-lg pb-4">
          <CardTitle className="text-xl text-gray-800">נתוני רשומות</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 font-bold mb-2">
                <FileText className="h-5 w-5" />
                שיעורים
              </div>
              <p className="text-2xl font-bold">{storageInfo.records.lessons}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                <FileBadge className="h-5 w-5" />
                בחינות
              </div>
              <p className="text-2xl font-bold">{storageInfo.records.exams}</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                <FileQuestion className="h-5 w-5" />
                תוצאות בחינות
              </div>
              <p className="text-2xl font-bold">{storageInfo.records.examResults}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-800 font-bold mb-2">
                <Image className="h-5 w-5" />
                תוכן קורס
              </div>
              <p className="text-2xl font-bold">{storageInfo.records.courseContents || 0}</p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
                <Users className="h-5 w-5" />
                משתמשים רשומים
              </div>
              <p className="text-2xl font-bold">{storageInfo.records.registeredUsers}</p>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>* הערכת גודל האחסון היא אומדן בלבד. גודל קבצי וידאו מוערך ב-50MB לקובץ, וקבצים מצורפים ב-5MB לקובץ.</p>
            <p>* גודל נתוני JSON: {storageInfo.size.dataSize} KB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
