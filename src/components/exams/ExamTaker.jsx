import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ExamTaker({ 
  exam, 
  onComplete, 
  onCancel, 
  showResults, 
  setShowResults,
  examScore
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(null));
  const [isSubmitting, setSubmitting] = useState(false);
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  // ✅ שמירת תשובה לשאלה הנוכחית
  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

  // ✅ כפתור הבא -> הגשת הבחינה אם הגענו לשאלה האחרונה
  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // ✅ כפתור חזרה -> מעביר לשאלה הקודמת
  const handleBack = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };


  const handleSubmit = async () => {
    if (isSubmitting) 
      return;
  
    setSubmitting(true);
  
    try {  
      const correctAnswers = answers.reduce(
        (count, answer, index) =>
          count + (answer === exam.questions[index].correct_answer ? 1 : 0),
        0
      );
  
      const finalScore = Math.round((correctAnswers / exam.questions.length) * 100);
  
      if (!isSubmitting) 
        await onComplete(exam.id, answers, finalScore, false);
      
    } catch (error) {
      console.error("[handleSubmit] Error submitting exam:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  
  
  // ✅ תצוגת תוצאות הבחינה (תישאר עד שהמשתמש יסגור)
  if (showResults) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className={`${examScore >= exam.passing_score ? 'bg-green-600' : 'bg-red-600'} text-white rounded-t-lg py-8`}>
          <CardTitle className="text-3xl font-bold text-center">
            {examScore >= exam.passing_score ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="h-8 w-8" />
                <span>כל הכבוד!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <AlertCircle className="h-8 w-8" />
                <span>נסה שוב</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-4">{examScore}%</div>
            <p className="text-lg text-gray-600">
              {examScore >= exam.passing_score
                ? "עברת את הבחינה בהצלחה!"
                : `ציון המעבר הנדרש הוא ${exam.passing_score}%. נסה שוב!`}
            </p>
          </div>

          {/* ✅ סיכום תשובות מלא */}
          <div className="space-y-8 mt-8 border-t pt-8">
            <h3 className="text-2xl font-bold text-center mb-6">סיכום תשובות</h3>
            {exam.questions.map((question, index) => {
              const isCorrect = answers[index] === question.correct_answer;
              const userAnswer = question.options[answers[index]];
              const correctAnswer = question.options[question.correct_answer];

              return (
                <div 
                  key={index}
                  className={cn(
                    "p-6 rounded-lg border",
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-4" dir="rtl">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2 text-right">
                        שאלה {index + 1}:
                      </h4>
                      <p className="text-gray-800 mb-4 text-right">
                        {question.question}
                      </p>
                    </div>
                    <div className="mr-4">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* ✅ תשובה נבחרת + תשובה נכונה */}
                  <div className="space-y-2 text-right" dir="rtl">
                    <div className="flex items-center">
                      <span className="font-medium ml-2">התשובה שלך:</span>
                      <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                        {userAnswer}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center">
                        <span className="font-medium ml-2">התשובה הנכונה:</span>
                        <span className="text-green-700">{correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ כפתורי סגירה */}
          <div className="mt-8 pt-6 border-t flex gap-4">
          <Button 
            onClick={() => {
              setShowResults(false);
              onCancel(); // סוגר את הבחינה בפועל
            }}
          >
            חזור לרשימת הבחינות
          </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-blue-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">שאלה {currentQuestionIndex + 1} מתוך {exam.questions.length}</div>
            <div className="text-sm">{exam.title}</div>
          </div>
          <Progress value={progress} className="bg-blue-700 h-2"/>
        </CardHeader>
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-right">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.image_url && (
                  <div className="mb-6">
                    <img 
                      src={currentQuestion.image_url} 
                      alt="תמונה לשאלה" 
                      className="max-w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
              
              <RadioGroup 
                value={answers[currentQuestionIndex]?.toString() || ""} 
                onValueChange={handleAnswer}
                className="space-y-4"
              >
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleAnswer(index.toString())}
                    dir="rtl"
                  >
                    <div className="flex items-center h-5 ml-3">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    </div>
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 text-lg font-medium text-gray-900 text-right"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between p-6 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
          >
            שאלה קודמת
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentQuestionIndex] === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שולח...
              </>
            ) : isLastQuestion ? (
              'סיים בחינה'
            ) : (
              'שאלה הבאה'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
