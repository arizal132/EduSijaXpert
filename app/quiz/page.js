'use client'

import { useState, useEffect } from 'react';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = [
    {
      question: "Berapakah hasil dari 15 + 27?",
      options: ["40", "42", "45", "47"],
      correct: 1,
      explanation: "15 + 27 = 42"
    },
    {
      question: "Jika 8 × 7 = ?, maka hasilnya adalah:",
      options: ["54", "56", "58", "60"],
      correct: 1,
      explanation: "8 × 7 = 56"
    },
    {
      question: "Berapakah 144 ÷ 12?",
      options: ["10", "11", "12", "13"],
      correct: 2,
      explanation: "144 ÷ 12 = 12"
    },
    {
      question: "Hasil dari 25 - 18 + 9 adalah:",
      options: ["14", "16", "18", "20"],
      correct: 1,
      explanation: "25 - 18 + 9 = 7 + 9 = 16"
    },
    {
      question: "Jika sebuah persegi panjang memiliki panjang 8 cm dan lebar 5 cm, berapakah luasnya?",
      options: ["35 cm²", "40 cm²", "45 cm²", "50 cm²"],
      correct: 1,
      explanation: "Luas = panjang × lebar = 8 × 5 = 40 cm²"
    }
  ];

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !quizFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered, quizFinished]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    setShowResult(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsAnswered(false);
    setTimeLeft(30);
    setQuizFinished(false);
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Sempurna! 🎉";
    if (percentage >= 80) return "Sangat Baik! 👏";
    if (percentage >= 60) return "Cukup Baik! 👍";
    return "Perlu Latihan Lagi! 📚";
  };

  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform animate-pulse">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-black mb-4">Quiz Selesai!</h2>
          <div className={`text-5xl font-bold mb-4 ${getScoreColor()}`}>
            {score}/{questions.length}
          </div>
          <p className="text-xl text-gray-600 mb-6">{getScoreMessage()}</p>
          <p className="text-gray-500 mb-8">
            Skor Anda: {Math.round((score / questions.length) * 100)}%
          </p>
          <button
            onClick={restartQuiz}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🔄 Main Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">🧮 Quiz Matematika</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-black">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
            <div className={`px-4 py-2 rounded-full ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <span className="text-sm font-semibold">⏰ {timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-6">
            {questions[currentQuestion].question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={`p-4 rounded-xl text-left font-semibold transition-all duration-200 transform hover:scale-105 ${
                  !isAnswered 
                    ? 'bg-red-100 text-black hover:bg-gray-200 hover:shadow-md' 
                    : selectedAnswer === index
                      ? index === questions[currentQuestion].correct
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-red-100 text-red-800 border-2 border-red-500'
                      : index === questions[currentQuestion].correct
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-500'
                } ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="mr-3 text-lg">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {isAnswered && index === questions[currentQuestion].correct && (
                  <span className="float-right text-green-600">✓</span>
                )}
                {isAnswered && selectedAnswer === index && index !== questions[currentQuestion].correct && (
                  <span className="float-right text-red-600">✗</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Result & Explanation */}
        {showResult && (
          <div className={`mb-6 p-4 rounded-xl ${
            selectedAnswer === questions[currentQuestion].correct 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : timeLeft === 0 
                ? 'bg-yellow-50 border-l-4 border-yellow-500'
                : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            <p className="font-semibold mb-2">
              {selectedAnswer === questions[currentQuestion].correct 
                ? '🎉 Benar!' 
                : timeLeft === 0 
                  ? '⏰ Waktu Habis!'
                  : '❌ Salah!'}
            </p>
            <p className="text-gray-700">
              <strong>Penjelasan:</strong> {questions[currentQuestion].explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {showResult && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Skor: <span className="font-semibold">{score}/{currentQuestion + 1}</span>
            </div>
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {currentQuestion === questions.length - 1 ? '🏁 Selesai' : '➡️ Soal Berikutnya'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}