
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Trash2, Upload, Loader2, Edit2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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

export default function ExamForm({ exam, onSave, onCancel }) {
  const [formData, setFormData] = useState(exam || {
    title: "",
    description: "",
    topic: "",
    questions: [],
    passing_score: 70
  });

  const [availableTopics, setAvailableTopics] = useState([]);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState([]);

  useEffect(() => {
    const savedTopics = localStorage.getItem('examTopics');
    if (savedTopics) {
      try {
        setAvailableTopics(JSON.parse(savedTopics));
      } catch (error) {
        console.error("Error loading saved topics:", error);
        const defaultTopics = [
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
        setAvailableTopics(defaultTopics);
        localStorage.setItem('examTopics', JSON.stringify(defaultTopics));
      }
    } else {
      const defaultTopics = [
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
      setAvailableTopics(defaultTopics);
      localStorage.setItem('examTopics', JSON.stringify(defaultTopics));
    }
  }, []);

  useEffect(() => {
    if (availableTopics.length > 0) {
      localStorage.setItem('examTopics', JSON.stringify(availableTopics));
    }
  }, [availableTopics]);

  const addCustomTopic = () => {
    if (!newTopicLabel) return;
    
    const newTopicId = newTopicLabel.toLowerCase().replace(/\s+/g, '_');
    
    setAvailableTopics(prev => [...prev, { id: newTopicId, label: newTopicLabel }]);
    setNewTopicLabel("");
    setShowTopicDialog(false);
  };

  const removeTopic = (topicId) => {
    setAvailableTopics(prev => prev.filter(topic => topic.id !== topicId));
    if (formData.topic === topicId) {
      setFormData(prev => ({ ...prev, topic: "" }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: "",
        image_url: "",
        options: ["", ""],
        correct_answer: 0
      }]
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].options.push("");
      return { ...prev, questions: updatedQuestions };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      
      let correctAnswer = updatedQuestions[questionIndex].correct_answer;
      if (optionIndex === correctAnswer) {
        correctAnswer = 0;
      } else if (optionIndex < correctAnswer) {
        correctAnswer--;
      }
      
      updatedQuestions[questionIndex].options = updatedOptions;
      updatedQuestions[questionIndex].correct_answer = correctAnswer;
      
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex].options = updatedOptions;
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleImageUpload = async (event, questionIndex) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(prev => [...prev, questionIndex]);
    
    try {
      console.log(`Starting image upload for question ${questionIndex}. Size: ${file.size} bytes, Name: ${file.name}`);
      
      const { file_url } = await UploadFile({ file });
      console.log(`Upload completed successfully. URL: ${file_url}`);
      
      handleQuestionChange(questionIndex, 'image_url', file_url);
      
      toast({
        title: "התמונה הועלתה בהצלחה",
        description: "התמונה הועלתה לשאלה בהצלחה",
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "שגיאה בהעלאת התמונה",
        description: "אירעה שגיאה בהעלאת התמונה, נסה שנית",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => prev.filter(idx => idx !== questionIndex));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("יש להזין כותרת לבחינה");
      return false;
    }
    
    if (!formData.topic) {
      setError("יש לבחור נושא לבחינה");
      return false;
    }
    
    if (formData.questions.length === 0) {
      setError("יש להוסיף לפחות שאלה אחת לבחינה");
      return false;
    }
    
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      
      if (!q.question.trim()) {
        setError(`שאלה ${i + 1}: יש להזין טקסט לשאלה`);
        return false;
      }
      
      if (q.options.length < 2) {
        setError(`שאלה ${i + 1}: יש להוסיף לפחות שתי אפשרויות תשובה`);
        return false;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`שאלה ${i + 1}, אפשרות ${j + 1}: יש להזין טקסט לאפשרות`);
          return false;
        }
      }
      
      if (q.correct_answer < 0 || q.correct_answer >= q.options.length) {
        setError(`שאלה ${i + 1}: יש לבחור תשובה נכונה`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      onSave(formData);
    } catch (error) {
      console.error("Error saving exam:", error);
      setError("אירעה שגיאה בשמירת הבחינה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-blue-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-right">{exam ? 'עריכת בחינה' : 'יצירת בחינה חדשה'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 text-right">
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg text-right block">כותרת הבחינה</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-right text-lg p-3"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg text-right block">תיאור הבחינה</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="text-right"
              dir="rtl"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="topic" className="text-lg text-right block">נושא</Label>
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
                          placeholder="לדוגמה: פעולות אריתמטיות"
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
                    <DialogFooter className="flex flex-row-reverse justify-start">
                      <Button onClick={() => setShowTopicDialog(false)}>סגור</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Select
                value={formData.topic}
                onValueChange={(value) => handleInputChange('topic', value)}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue placeholder="בחר נושא" />
                </SelectTrigger>
                <SelectContent align="end" className="text-right" dir="rtl">
                  {availableTopics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id} className="text-right" dir="rtl">
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="passing_score" className="text-lg text-right block">ציון עובר</Label>
              <div className="flex items-center">
                <Input
                  id="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => handleInputChange('passing_score', Number(e.target.value))}
                  min="1"
                  max="100"
                  className="text-right"
                  dir="rtl"
                />
                <span className="mr-2 text-lg">%</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4 text-right">שאלות</h2>
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={addQuestion}
                className="text-lg bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="ml-2 h-5 w-5" />
                הוסף שאלה
              </Button>
              <h3 className="text-xl font-bold text-blue-800">
                שאלות ({formData.questions.length})
              </h3>
            </div>
            
            <ScrollArea className="max-h-96 overflow-auto">
              <div className="space-y-10">
                {formData.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border p-6 rounded-lg bg-gray-50 relative">
                    <div className="absolute left-4 top-4">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="mb-8">
                      <div className="mb-6">
                        <Label htmlFor={`q${questionIndex}`} className="text-xl font-medium mb-2 block">
                          שאלה {questionIndex + 1}
                        </Label>
                        <Textarea
                          id={`q${questionIndex}`}
                          value={question.question}
                          onChange={e => handleQuestionChange(questionIndex, 'question', e.target.value)}
                          className="text-lg text-right"
                          dir="rtl"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <Label className="text-md font-medium mb-2 block">
                          תמונה נלווית לשאלה (אופציונלי)
                        </Label>
                        
                        {question.image_url ? (
                          <div className="mt-2 mb-4">
                            <div className="relative w-full max-w-md mx-auto">
                              <img 
                                src={question.image_url} 
                                alt="תמונה לשאלה" 
                                className="rounded-md border border-gray-200 max-h-48 object-contain mx-auto"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full"
                                onClick={() => handleQuestionChange(questionIndex, 'image_url', '')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, questionIndex)}
                                disabled={uploading.includes(questionIndex)}
                              />
                              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 transition-colors">
                                {uploading.includes(questionIndex) ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    <span>מעלה תמונה...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">לחץ להעלאת תמונה</p>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-md">אפשרויות תשובה</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(questionIndex)}
                            className="text-blue-600 text-sm"
                          >
                            <Plus className="h-4 w-4 ml-1" />
                            הוסף אפשרות
                          </Button>
                        </div>

                        <div className="space-y-3 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-medium">
                                {optionIndex + 1}
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={option}
                                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                  className="text-right"
                                  dir="rtl"
                                  placeholder={`אפשרות ${optionIndex + 1}`}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                className="text-gray-500 hover:text-red-600"
                                disabled={question.options.length <= 2}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id={`correct-${questionIndex}-${optionIndex}`}
                                  name={`correct-${questionIndex}`}
                                  checked={question.correct_answer === optionIndex}
                                  onChange={() => handleQuestionChange(questionIndex, 'correct_answer', optionIndex)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <label
                                  htmlFor={`correct-${questionIndex}-${optionIndex}`}
                                  className="mr-2 text-sm text-gray-700"
                                >
                                  תשובה נכונה
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.questions.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">טרם הוספו שאלות לבחינה</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-gray-50 flex-col space-y-4">
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-2 text-center w-full">
            <p>{error}</p>
          </div>
        )}
        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={onCancel}>
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              exam ? 'עדכן בחינה' : 'צור בחינה'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
