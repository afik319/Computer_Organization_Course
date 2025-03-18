
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Now all topics will be editable
const DEFAULT_TOPICS = [
  { value: "processor_architecture", label: "ארכיטקטורת מעבדים" },
  { value: "memory_systems", label: "מערכות זיכרון" },
  { value: "instruction_sets", label: "סט הוראות" },
  { value: "pipelining", label: "שיטות צנרת" },
  { value: "cache", label: "זיכרון מטמון" },
  { value: "io_systems", label: "מערכות קלט/פלט" },
  { value: "assembly_language", label: "שפת סף" },
  { value: "performance_optimization", label: "אופטימיזציית ביצועים" }
];

export default function ExamForm({ exam, onSave, onCancel }) {
  const [formData, setFormData] = useState(exam || {
    title: "",
    description: "",
    topic: "",
    questions: [],
    passing_score: 70
  });
  
  const [availableTopics, setAvailableTopics] = useState([...DEFAULT_TOPICS]);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [newTopicValue, setNewTopicValue] = useState("");
  const [newTopicLabel, setNewTopicLabel] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), {
        question: "",
        options: ["", "", "", ""],
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

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => j === optionIndex ? value : opt)
        } : q
      )
    }));
  };

  const addOptionToQuestion = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: [...q.options, ""]
        } : q
      )
    }));
  };

  const removeOptionFromQuestion = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q;
        
        const newOptions = q.options.filter((_, j) => j !== optionIndex);
        let newCorrectAnswer = q.correct_answer;
        
        // Adjust correct answer if needed
        if (q.correct_answer === optionIndex) {
          newCorrectAnswer = 0;
        } else if (q.correct_answer > optionIndex) {
          newCorrectAnswer--;
        }
        
        return {
          ...q,
          options: newOptions,
          correct_answer: newCorrectAnswer
        };
      })
    }));
  };
  
  const addCustomTopic = () => {
    if (!newTopicValue || !newTopicLabel) return;
    
    setAvailableTopics(prev => [...prev, { value: newTopicValue, label: newTopicLabel }]);
    setNewTopicValue("");
    setNewTopicLabel("");
  };

  const removeTopic = (topicValue) => {
    setAvailableTopics(prev => prev.filter(topic => topic.value !== topicValue));
    if (formData.topic === topicValue) {
      setFormData(prev => ({ ...prev, topic: "" }));
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-blue-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl text-right">{exam ? 'עריכת בחינה' : 'בחינה חדשה'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3 text-right">
            <Label htmlFor="title" className="text-lg">כותרת</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 text-right"
              dir="rtl"
            />
          </div>
          <div className="space-y-3 text-right">
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
                    <div className="space-y-2">
                      <Label htmlFor="topicValue">מזהה הנושא (באנגלית)</Label>
                      <Input
                        id="topicValue"
                        value={newTopicValue}
                        onChange={(e) => setNewTopicValue(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                        dir="ltr"
                        placeholder="לדוגמה: operating_systems"
                      />
                    </div>
                    <Button 
                      onClick={addCustomTopic} 
                      disabled={!newTopicValue || !newTopicLabel}
                      className="w-full"
                    >
                      הוסף נושא
                    </Button>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">נושאים קיימים</h4>
                      <div className="space-y-2">
                        {availableTopics.map(topic => (
                          <div key={topic.value} className="flex justify-between items-center p-2 border rounded">
                            <span>{topic.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopic(topic.value)}
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
              <SelectTrigger className="p-3 text-lg border-gray-300 text-right">
                <SelectValue placeholder="בחרו נושא" />
              </SelectTrigger>
              <SelectContent align="end">
                {availableTopics.map(topic => (
                  <SelectItem key={topic.value} value={topic.value} className="text-lg text-right">
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 text-right">
          <Label htmlFor="description" className="text-lg">תיאור</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 text-right"
            dir="rtl"
          />
        </div>

        <div className="space-y-3 text-right">
          <Label htmlFor="passing_score" className="text-lg">ציון עובר (%)</Label>
          <Input
            id="passing_score"
            type="number"
            min="0"
            max="100"
            value={formData.passing_score}
            onChange={(e) => handleInputChange('passing_score', parseInt(e.target.value))}
            className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 text-right"
            dir="rtl"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg text-right">שאלות</Label>
            <Button
              variant="outline"
              onClick={addQuestion}
              className="flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 border-teal-200 px-4 py-2 text-lg text-right flex-row-reverse"
            >
              <Plus className="h-5 w-5 mr-1" />
              הוספת שאלה
            </Button>
          </div>

          {(formData.questions || []).map((q, qIndex) => (
            <Card key={qIndex} className="relative border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 text-right">
                    <Label className="mb-2 block text-lg font-medium text-blue-800">שאלה {qIndex + 1}</Label>
                    <Textarea
                      value={q.question || ""}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      rows={2}
                      className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOptionToQuestion(qIndex)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      הוסף אפשרות
                    </Button>
                    <Label className="text-lg">אפשרויות</Label>
                  </div>
                  {(q.options || []).map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <Input
                        type="radio"
                        className="w-5 h-5 accent-blue-800"
                        checked={q.correct_answer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                      />
                      <Input
                        value={option || ""}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`אפשרות ${oIndex + 1}`}
                        className="text-lg p-3 border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 flex-1 text-right"
                        dir="rtl"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeOptionFromQuestion(qIndex, oIndex)}
                        disabled={q.options.length <= 2}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
        <Button 
          onClick={onCancel}
          variant="outline"
          className="text-lg px-6 py-3 border-gray-300"
        >
          ביטול
        </Button>
        <Button 
          onClick={() => onSave(formData)} 
          className="bg-teal-600 hover:bg-teal-700 text-lg px-6 py-3 text-right"
        >
          {exam ? 'עדכון בחינה' : 'יצירת בחינה'}
        </Button>
      </CardFooter>
    </Card>
  );
}
