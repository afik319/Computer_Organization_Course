import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, Loader2, Edit2, Trash2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// עורך טקסט עשיר
import ReactQuill from 'react-quill';

// נושאים ברירת מחדל לשימוש ראשוני
const DEFAULT_TOPICS = [
  { id: "topic_1", label: "ארכיטקטורת מעבדים" },
  { id: "topic_2", label: "מערכות זיכרון" },
  { id: "topic_3", label: "סט הוראות" },
  { id: "topic_4", label: "שיטות צנרת" },
  { id: "topic_5", label: "זיכרון מטמון" },
  { id: "topic_6", label: "מערכות קלט/פלט" },
  { id: "topic_7", label: "שפת סף" },
  { id: "topic_8", label: "אופטימיזציית ביצועים" }
];

// הגדרת עורך טקסט
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link'
];

export default function LessonForm({ lesson, onSave, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState(lesson || {
    title: "",
    description: "",
    topic: "",
    video_url: "",
    attachments: [],
    order: 0
  });
  
  // הוספת מצב לניהול נושאים - שימוש ב-localStorage לשמירת נושאים מותאמים אישית
  const [availableTopics, setAvailableTopics] = useState([]);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState("");
  
  // טעינת נושאים מ-localStorage בעת טעינת הקומפוננטה
  useEffect(() => {
    const savedTopics = localStorage.getItem('lessonTopics');
    if (savedTopics) {
      try {
        setAvailableTopics(JSON.parse(savedTopics));
      } catch (error) {
        console.error("Error loading saved topics:", error);
        setAvailableTopics(DEFAULT_TOPICS);
      }
    } else {
      setAvailableTopics(DEFAULT_TOPICS);
    }
  }, []);

  // שמירת נושאים ל-localStorage בכל פעם שהם משתנים
  useEffect(() => {
    if (availableTopics.length > 0) {
      localStorage.setItem('lessonTopics', JSON.stringify(availableTopics));
    }
  }, [availableTopics]);

  const handleInputChange = (field, value) => {
    // מטפל במיוחד בשדה order כדי להבטיח שהוא מספר
    if (field === 'order') {
      // וידוא שהערך הוא מספר תקין ולא NaN
      const numValue = Number(value);
      value = isNaN(numValue) ? 0 : numValue;

      // וידוא שערך ה-order מאוחסן כמספר ולא כמחרוזת
      console.log(`Setting order to ${value} (${typeof value})`);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // הצגת הודעת טעינה
    setIsUploading(true);
    
    try {
      console.log(`Starting file upload. Type: ${type}, Size: ${file.size} bytes, Name: ${file.name}`);
      
      // העלאת הקובץ ללא בדיקת גודל - אנחנו מסירים את המגבלה
      const { file_url } = await UploadFile({ file });
      console.log(`Upload completed successfully. URL: ${file_url}`);
      
      if (type === 'video') {
        handleInputChange('video_url', file_url);
      } else {
        const newAttachment = {
          title: file.name,
          file_url,
          type
        };
        handleInputChange('attachments', [...formData.attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // אפשר להוסיף כאן הודעת שגיאה למשתמש
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    handleInputChange('attachments', newAttachments);
  };

  // פונקציות לניהול נושאים
  const addCustomTopic = () => {
    if (!newTopicLabel) return;
    
    // יצירת מזהה מספרי חדש לנושא
    let highestId = 0;
    availableTopics.forEach(topic => {
      const idMatch = topic.id.match(/topic_(\d+)/);
      if (idMatch && parseInt(idMatch[1]) > highestId) {
        highestId = parseInt(idMatch[1]);
      }
    });
    
    const newTopicId = `topic_${highestId + 1}`;
    
    setAvailableTopics(prev => [...prev, { id: newTopicId, label: newTopicLabel }]);
    setNewTopicLabel("");
  };

  const removeTopic = (topicId) => {
    setAvailableTopics(prev => prev.filter(topic => topic.id !== topicId));
    if (formData.topic === topicId) {
      setFormData(prev => ({ ...prev, topic: "" }));
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-blue-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl">{lesson ? 'עריכת שיעור' : 'שיעור חדש'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-lg">כותרת</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-lg">תיאור</Label>
          <div className="text-editor-container" dir="rtl">
            <ReactQuill
              value={formData.description}
              onChange={(content) => handleInputChange('description', content)}
              modules={quillModules}
              formats={quillFormats}
              className="text-lg border-gray-300 rounded-md"
              theme="snow"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Edit2 className="ml-1 h-4 w-4" />
                    ערוך נושאים
                  </Button>
                </DialogTrigger>
                <DialogContent className="text-right">
                  <DialogHeader>
                    <DialogTitle>עריכת נושאים</DialogTitle>
                    <DialogDescription>
                      ניתן להוסיף נושאים חדשים או למחוק נושאים קיימים
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="topicLabel">שם הנושא</Label>
                      <Input
                        id="topicLabel"
                        value={newTopicLabel}
                        onChange={(e) => setNewTopicLabel(e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder="לדוגמה: מערכות הפעלה"
                      />
                    </div>
                    <Button 
                      onClick={addCustomTopic} 
                      disabled={!newTopicLabel}
                      className="w-full"
                    >
                      הוסף נושא
                    </Button>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">נושאים קיימים</h4>
                      <div className="space-y-2">
                        {availableTopics.map(topic => (
                          <div key={topic.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{topic.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopic(topic.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Label htmlFor="topic" className="text-lg">נושא</Label>
            </div>
            <Select
              value={formData.topic}
              onValueChange={(value) => handleInputChange('topic', value)}
            >
              <SelectTrigger className="p-3 text-lg border-gray-300">
                <SelectValue placeholder="בחרו נושא" />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map(topic => (
                  <SelectItem key={topic.id} value={topic.id} className="text-lg">
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="order" className="text-lg">סדר</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value, 10) || 0)}
              min="0"
              max="9999"
            />
            <div className="text-sm text-gray-500">
              מספר המייצג את סדר השיעור בתוך הנושא. השתמש במספרים שלמים חיוביים (1, 2, וכו').
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-lg">וידאו</Label>
          <div className="flex items-center gap-4">
            {formData.video_url ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg w-full">
                <span className="text-lg font-medium">הוידאו הועלה בהצלחה</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleInputChange('video_url', '')}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                  <div className="flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                    {isUploading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-800" />
                        <span className="text-lg font-medium">מעלה... תהליך זה עשוי להימשך זמן מה</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="h-10 w-10 text-blue-800" />
                        <span className="text-lg font-medium">לחצו להעלאת וידאו</span>
                        <span className="text-sm text-gray-500">או גררו קובץ לכאן</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-lg">קבצים מצורפים</Label>
          <div className="space-y-3">
            {formData.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <span className="text-lg">{attachment.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-3">
              <label className="flex-1">
                <Input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'presentation')}
                />
                <div className="cursor-pointer flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <Plus className="h-5 w-5 ml-2 text-blue-800" />
                  <span className="text-lg font-medium">הוספת מצגת</span>
                </div>
              </label>
              <label className="flex-1">
                <Input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                />
                <div className="cursor-pointer flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <Plus className="h-5 w-5 ml-2 text-blue-800" />
                  <span className="text-lg font-medium">הוספת PDF</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start gap-3 p-6 bg-gray-50 rounded-b-lg">
        <Button 
          onClick={() => onSave(formData)} 
          disabled={isUploading}
          className="bg-teal-600 hover:bg-teal-700 text-lg px-6 py-3"
        >
          {lesson ? 'עדכון שיעור' : 'יצירת שיעור'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="text-lg px-6 py-3 border-gray-300"
        >
          ביטול
        </Button>
      </CardFooter>
    </Card>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, Loader2, Edit2, Trash2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// עורך טקסט עשיר
import ReactQuill from 'react-quill';

// נושאים ברירת מחדל לשימוש ראשוני
const DEFAULT_TOPICS = [
  { id: "topic_1", label: "ארכיטקטורת מעבדים" },
  { id: "topic_2", label: "מערכות זיכרון" },
  { id: "topic_3", label: "סט הוראות" },
  { id: "topic_4", label: "שיטות צנרת" },
  { id: "topic_5", label: "זיכרון מטמון" },
  { id: "topic_6", label: "מערכות קלט/פלט" },
  { id: "topic_7", label: "שפת סף" },
  { id: "topic_8", label: "אופטימיזציית ביצועים" }
];

// הגדרת עורך טקסט
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link'
];

export default function LessonForm({ lesson, onSave, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState(lesson || {
    title: "",
    description: "",
    topic: "",
    video_url: "",
    attachments: [],
    order: 0
  });
  
  // הוספת מצב לניהול נושאים - שימוש ב-localStorage לשמירת נושאים מותאמים אישית
  const [availableTopics, setAvailableTopics] = useState([]);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState("");
  
  // טעינת נושאים מ-localStorage בעת טעינת הקומפוננטה
  useEffect(() => {
    const savedTopics = localStorage.getItem('lessonTopics');
    if (savedTopics) {
      try {
        setAvailableTopics(JSON.parse(savedTopics));
      } catch (error) {
        console.error("Error loading saved topics:", error);
        setAvailableTopics(DEFAULT_TOPICS);
      }
    } else {
      setAvailableTopics(DEFAULT_TOPICS);
    }
  }, []);

  // שמירת נושאים ל-localStorage בכל פעם שהם משתנים
  useEffect(() => {
    if (availableTopics.length > 0) {
      localStorage.setItem('lessonTopics', JSON.stringify(availableTopics));
    }
  }, [availableTopics]);

  const handleInputChange = (field, value) => {
    // מטפל במיוחד בשדה order כדי להבטיח שהוא מספר
    if (field === 'order') {
      // וידוא שהערך הוא מספר תקין ולא NaN
      const numValue = Number(value);
      value = isNaN(numValue) ? 0 : numValue;

      // וידוא שערך ה-order מאוחסן כמספר ולא כמחרוזת
      console.log(`Setting order to ${value} (${typeof value})`);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // הצגת הודעת טעינה
    setIsUploading(true);
    
    try {
      console.log(`Starting file upload. Type: ${type}, Size: ${file.size} bytes, Name: ${file.name}`);
      
      // העלאת הקובץ ללא בדיקת גודל - אנחנו מסירים את המגבלה
      const { file_url } = await UploadFile({ file });
      console.log(`Upload completed successfully. URL: ${file_url}`);
      
      if (type === 'video') {
        handleInputChange('video_url', file_url);
      } else {
        const newAttachment = {
          title: file.name,
          file_url,
          type
        };
        handleInputChange('attachments', [...formData.attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // אפשר להוסיף כאן הודעת שגיאה למשתמש
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    handleInputChange('attachments', newAttachments);
  };

  // פונקציות לניהול נושאים
  const addCustomTopic = () => {
    if (!newTopicLabel) return;
    
    // יצירת מזהה מספרי חדש לנושא
    let highestId = 0;
    availableTopics.forEach(topic => {
      const idMatch = topic.id.match(/topic_(\d+)/);
      if (idMatch && parseInt(idMatch[1]) > highestId) {
        highestId = parseInt(idMatch[1]);
      }
    });
    
    const newTopicId = `topic_${highestId + 1}`;
    
    setAvailableTopics(prev => [...prev, { id: newTopicId, label: newTopicLabel }]);
    setNewTopicLabel("");
  };

  const removeTopic = (topicId) => {
    setAvailableTopics(prev => prev.filter(topic => topic.id !== topicId));
    if (formData.topic === topicId) {
      setFormData(prev => ({ ...prev, topic: "" }));
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-blue-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl">{lesson ? 'עריכת שיעור' : 'שיעור חדש'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-lg">כותרת</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-lg">תיאור</Label>
          <div className="text-editor-container" dir="rtl">
            <ReactQuill
              value={formData.description}
              onChange={(content) => handleInputChange('description', content)}
              modules={quillModules}
              formats={quillFormats}
              className="text-lg border-gray-300 rounded-md"
              theme="snow"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Edit2 className="ml-1 h-4 w-4" />
                    ערוך נושאים
                  </Button>
                </DialogTrigger>
                <DialogContent className="text-right">
                  <DialogHeader>
                    <DialogTitle>עריכת נושאים</DialogTitle>
                    <DialogDescription>
                      ניתן להוסיף נושאים חדשים או למחוק נושאים קיימים
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="topicLabel">שם הנושא</Label>
                      <Input
                        id="topicLabel"
                        value={newTopicLabel}
                        onChange={(e) => setNewTopicLabel(e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder="לדוגמה: מערכות הפעלה"
                      />
                    </div>
                    <Button 
                      onClick={addCustomTopic} 
                      disabled={!newTopicLabel}
                      className="w-full"
                    >
                      הוסף נושא
                    </Button>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">נושאים קיימים</h4>
                      <div className="space-y-2">
                        {availableTopics.map(topic => (
                          <div key={topic.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{topic.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopic(topic.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Label htmlFor="topic" className="text-lg">נושא</Label>
            </div>
            <Select
              value={formData.topic}
              onValueChange={(value) => handleInputChange('topic', value)}
            >
              <SelectTrigger className="p-3 text-lg border-gray-300">
                <SelectValue placeholder="בחרו נושא" />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map(topic => (
                  <SelectItem key={topic.id} value={topic.id} className="text-lg">
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="order" className="text-lg">סדר</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value, 10) || 0)}
              min="0"
              max="9999"
            />
            <div className="text-sm text-gray-500">
              מספר המייצג את סדר השיעור בתוך הנושא. השתמש במספרים שלמים חיוביים (1, 2, וכו').
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-lg">וידאו</Label>
          <div className="flex items-center gap-4">
            {formData.video_url ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg w-full">
                <span className="text-lg font-medium">הוידאו הועלה בהצלחה</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleInputChange('video_url', '')}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                  <div className="flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                    {isUploading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-800" />
                        <span className="text-lg font-medium">מעלה... תהליך זה עשוי להימשך זמן מה</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="h-10 w-10 text-blue-800" />
                        <span className="text-lg font-medium">לחצו להעלאת וידאו</span>
                        <span className="text-sm text-gray-500">או גררו קובץ לכאן</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-lg">קבצים מצורפים</Label>
          <div className="space-y-3">
            {formData.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <span className="text-lg">{attachment.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-3">
              <label className="flex-1">
                <Input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'presentation')}
                />
                <div className="cursor-pointer flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <Plus className="h-5 w-5 ml-2 text-blue-800" />
                  <span className="text-lg font-medium">הוספת מצגת</span>
                </div>
              </label>
              <label className="flex-1">
                <Input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                />
                <div className="cursor-pointer flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <Plus className="h-5 w-5 ml-2 text-blue-800" />
                  <span className="text-lg font-medium">הוספת PDF</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start gap-3 p-6 bg-gray-50 rounded-b-lg">
        <Button 
          onClick={() => onSave(formData)} 
          disabled={isUploading}
          className="bg-teal-600 hover:bg-teal-700 text-lg px-6 py-3"
        >
          {lesson ? 'עדכון שיעור' : 'יצירת שיעור'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="text-lg px-6 py-3 border-gray-300"
        >
          ביטול
        </Button>
      </CardFooter>
    </Card>
  );
}