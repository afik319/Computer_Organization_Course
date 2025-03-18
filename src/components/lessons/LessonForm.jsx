import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";

const TOPICS = [
  { value: "processor_architecture", label: "ארכיטקטורת מעבדים" },
  { value: "memory_systems", label: "מערכות זיכרון" },
  { value: "instruction_sets", label: "סט הוראות" },
  { value: "pipelining", label: "שיטות צנרת" },
  { value: "cache", label: "זיכרון מטמון" },
  { value: "io_systems", label: "מערכות קלט/פלט" },
  { value: "assembly_language", label: "שפת סף" },
  { value: "performance_optimization", label: "אופטימיזציית ביצועים" }
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
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
    }
    setIsUploading(false);
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    handleInputChange('attachments', newAttachments);
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
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="topic" className="text-lg">נושא</Label>
            <Select
              value={formData.topic}
              onValueChange={(value) => handleInputChange('topic', value)}
            >
              <SelectTrigger className="p-3 text-lg border-gray-300">
                <SelectValue placeholder="בחרו נושא" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map(topic => (
                  <SelectItem key={topic.value} value={topic.value} className="text-lg">
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
              onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
              className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            />
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
                        <span className="text-lg font-medium">מעלה...</span>
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