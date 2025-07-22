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
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [playerName, setPlayerName] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [detailedResults, setDetailedResults] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Load questions dari API
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Simulasi API call - dalam implementasi nyata, ganti dengan fetch ke API
      const mockQuestions = [
        {
          id: 1,
          question: "Berapakah hasil dari 15 + 27?",
          options: ["40", "42", "45", "47"],
          category: "aritmatika",
          difficulty: "mudah"
        },
        {
          id: 2,
          question: "Jika 8 × 7 = ?, maka hasilnya adalah:",
          options: ["54", "56", "58", "60"],
          category: "perkalian", 
          difficulty: "mudah"
        },
        {
          id: 3,
          question: "Berapakah 144 ÷ 12?",
          options: ["10", "11", "12", "13"],
          category: "pembagian",
          difficulty: "mudah"
        },
        {
          id: 4,
          question: "Hasil dari 25 - 18 + 9 adalah:",
          options: ["14", "16", "18", "20"],
          category: "aritmatika",
          difficulty: "mudah"
        },
        {
          id: 5,
          question: "Jika sebuah persegi panjang memiliki panjang 8 cm dan lebar 5 cm, berapakah luasnya?",
          options: ["35 cm²", "40 cm²", "45 cm²", "50 cm²"],
          category: "geometri",
          difficulty: "sedang"
        }
      ];
      
      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      setApiError('Gagal memuat soal. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && quizStarted && !quizFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && quizStarted) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered, quizStarted, quizFinished]);

  const handleTimeUp = async () => {
    setIsAnswered(true);
    setShowResult(true);
    
    // Kirim jawaban kosong ke API
    await checkAnswer(currentQuestion, null, 0);
  };

  const checkAnswer = async (questionIndex, answerIndex, timeRemaining) => {
    try {
      // Simulasi API call ke /api/cekjawaban
      const mockResponses = [
        { isCorrect: answerIndex === 1, explanation: "15 + 27 = 42", score: answerIndex === 1 ? 15 : 0 },
        { isCorrect: answerIndex === 1, explanation: "8 × 7 = 56", score: answerIndex === 1 ? 15 : 0 },
        { isCorrect: answerIndex === 2, explanation: "144 ÷ 12 = 12", score: answerIndex === 2 ? 15 : 0 },
        { isCorrect: answerIndex === 1, explanation: "25 - 18 + 9 = 7 + 9 = 16", score: answerIndex === 1 ? 15 : 0 },
        { isCorrect: answerIndex === 1, explanation: "Luas = panjang × lebar = 8 × 5 = 40 cm²", score: answerIndex === 1 ? 15 : 0 }
      ];

      const result = mockResponses[questionIndex];
      
      // Simpan hasil detail
      setDetailedResults(prev => [...prev, {
        questionId: questions[questionIndex].id,
        question: questions[questionIndex].question,
        selectedAnswer: answerIndex,
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        score: result.score,
        timeUsed: 30 - timeRemaining
      }]);

      if (result.isCorrect) {
        setScore(prev => prev + 1);
      }

      return result;
    } catch (error) {
      console.error('Error checking answer:', error);
      return { isCorrect: false, explanation: 'Terjadi kesalahan', score: 0 };
    }
  };

  const handleAnswerSelect = async (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowResult(true);
    
    await checkAnswer(currentQuestion, answerIndex, timeLeft);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    
    // Simpan skor ke API
    try {
      const totalScore = Math.round((score / questions.length) * 100);
      const duration = (questions.length * 30) - timeLeft; // Total waktu yang digunakan
      
      // Simulasi API call ke /api/skor
      console.log('Saving score:', {
        sessionId,
        playerName: playerName || 'Anonymous',
        totalQuestions: questions.length,
        correctAnswers: score,
        totalScore,
        duration,
        difficulty: 'mudah',
        answers: detailedResults
      });
      
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const startQuiz = () => {
    if (!playerName.trim()) {
      alert('Silakan masukkan nama Anda terlebih dahulu!');
      return;
    }
    setQuizStarted(true);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsAnswered(false);
    setTimeLeft(30);
    setQuizFinished(false);
    setQuizStarted(false);
    setDetailedResults([]);
    setPlayerName('');
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{apiError}</p>
          <button
            onClick={loadQuestions}
            className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all duration-200"
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🧮</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Matematika</h1>
          <p className="text-gray-600 mb-6">
            Siap menguji kemampuan matematika Anda?<br/>
            Quiz ini terdiri dari {questions.length} soal dengan waktu 30 detik per soal.
          </p>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Masukkan nama Anda..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-semibold text-blue-800">Total Soal</div>
              <div className="text-blue-600">{questions.length} soal</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-semibold text-green-800">Waktu per Soal</div>
              <div className="text-green-600">30 detik</div>
            </div>
          </div>
          
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg w-full"
          >
            🚀 Mulai Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz finished screen
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Selesai!</h2>
            <p className="text-xl text-gray-600">Selamat {playerName}!</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
                {score}/{questions.length}
              </div>
              <p className="text-gray-600">Jawaban Benar</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <p className="text-gray-600">Akurasi</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Detail Hasil</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {detailedResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  result.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        Soal {index + 1}: {result.question.substring(0, 50)}...
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {result.isCorrect ? '✅ Benar' : '❌ Salah'} • 
                        Waktu: {result.timeUsed}s • 
                        Skor: {result.score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 mb-4">{getScoreMessage()}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={restartQuiz}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🔄 Main Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
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
            <div className={`px-4 py-2 rounded-full ${timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
              <span className="text-sm font-semibold">⏰ {timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Player info & Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">👤 {playerName}</span>
            <span className="text-sm text-gray-600">🎯 Skor: {score}/{currentQuestion + (isAnswered ? 1 : 0)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-4">
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {questions[currentQuestion]?.category} • {questions[currentQuestion]?.difficulty}
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-black mb-6">
            {questions[currentQuestion]?.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            {questions[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={`p-4 rounded-xl text-left font-semibold transition-all duration-200 transform hover:scale-105 ${
                  !isAnswered 
                    ? 'bg-gray-100 text-black hover:bg-gray-200 hover:shadow-md border-2 border-transparent' 
                    : selectedAnswer === index
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-500 border-2 border-transparent'
                } ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="mr-3 text-lg font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {isAnswered && selectedAnswer === index && (
                  <span className="float-right text-blue-600">👆</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Result & Next Button */}
        {showResult && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
              <p className="font-semibold mb-2 text-blue-800">
                {selectedAnswer !== null ? '✅ Jawaban tercatat!' : '⏰ Waktu habis!'}
              </p>
              <p className="text-blue-700 text-sm">
                {selectedAnswer !== null 
                  ? `Anda memilih: ${String.fromCharCode(65 + selectedAnswer)}. ${questions[currentQuestion]?.options[selectedAnswer]}`
                  : 'Tidak ada jawaban yang dipilih.'}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Progres: <span className="font-semibold">{currentQuestion + 1}/{questions.length}</span>
              </div>
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {currentQuestion === questions.length - 1 ? '🏁 Selesai' : '➡️ Soal Berikutnya'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}