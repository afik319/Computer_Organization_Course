import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamTaker({ exam, onComplete, onCancel }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(exam.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    const correctAnswers = exam.questions.reduce((sum, q, index) => {
      return sum + (selectedAnswers[index] === q.correct_answer ? 1 : 0);
    }, 0);
    return Math.round((correctAnswers / exam.questions.length) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);
    onComplete(exam.id, selectedAnswers, finalScore);
  };

  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  if (submitted) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-10">
          <div className="text-center space-y-6">
            {score >= exam.passing_score ? (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-600">כל הכבוד!</h2>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-red-600">המשיכו לתרגל</h2>
              </>
            )}
            <p className="text-2xl">הציון שלך: {score}%</p>
            <p className="text-xl text-gray-600">
              {score >= exam.passing_score
                ? "עברת את הבחינה בהצלחה!"
                : "לא הגעת לציון העובר. חזור על החומר ונסה שוב."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-2 bg-blue-800 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{exam.title}</CardTitle>
          <span className="text-lg font-medium text-white">
            שאלה {currentQuestion + 1} מתוך {exam.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-4 bg-blue-700" indicatorClassName="bg-white" />
      </CardHeader>
      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
              <p className="text-2xl font-medium">
                {exam.questions[currentQuestion].question}
              </p>
              <div className="space-y-4">
                {exam.questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                    className={`w-full justify-start text-right h-auto py-4 px-6 text-lg ${
                      selectedAnswers[currentQuestion] === index 
                        ? "bg-blue-800 text-white" 
                        : "bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-800"
                    }`}
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-gray-50">
        <Button
          onClick={() => {
            if (currentQuestion === exam.questions.length - 1) {
              handleSubmit();
            } else {
              setCurrentQuestion(prev => prev + 1);
            }
          }}
          disabled={selectedAnswers[currentQuestion] === null}
          className={`px-6 py-3 text-lg ${
            currentQuestion === exam.questions.length - 1 
              ? "bg-teal-600 hover:bg-teal-700" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {currentQuestion === exam.questions.length - 1 ? 'סיום בחינה' : 'השאלה הבאה'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (currentQuestion === 0) {
              onCancel();
            } else {
              setCurrentQuestion(prev => prev - 1);
            }
          }}
          className="text-lg px-6 py-3 border-gray-300"
        >
          {currentQuestion === 0 ? 'ביטול' : 'השאלה הקודמת'}
        </Button>
      </CardFooter>
    </Card>
  );
}