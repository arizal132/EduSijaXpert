// app/api/cekjawaban/route.js

import { NextResponse } from 'next/server';

// Simulasi database soal
const questions = [
  {
    id: 1,
    question: "Berapakah hasil dari 15 + 27?",
    options: ["40", "42", "45", "47"],
    correct: 1,
    explanation: "15 + 27 = 42"
  },
  {
    id: 2,
    question: "Jika 8 × 7 = ?, maka hasilnya adalah:",
    options: ["54", "56", "58", "60"],
    correct: 1,
    explanation: "8 × 7 = 56"
  },
  {
    id: 3,
    question: "Berapakah 144 ÷ 12?",
    options: ["10", "11", "12", "13"],
    correct: 2,
    explanation: "144 ÷ 12 = 12"
  },
  {
    id: 4,
    question: "Hasil dari 25 - 18 + 9 adalah:",
    options: ["14", "16", "18", "20"],
    correct: 1,
    explanation: "25 - 18 + 9 = 7 + 9 = 16"
  },
  {
    id: 5,
    question: "Jika sebuah persegi panjang memiliki panjang 8 cm dan lebar 5 cm, berapakah luasnya?",
    options: ["35 cm²", "40 cm²", "45 cm²", "50 cm²"],
    correct: 1,
    explanation: "Luas = panjang × lebar = 8 × 5 = 40 cm²"
  }
];

// Simulasi database skor
let scoreHistory = [];

export async function POST(request) {
  try {
    const body = await request.json();
    const { questionId, selectedAnswer, timeRemaining, sessionId } = body;

    // Validasi input
    if (questionId === undefined || selectedAnswer === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: questionId and selectedAnswer' 
        },
        { status: 400 }
      );
    }

    // Cari soal berdasarkan ID
    const question = questions.find(q => q.id === questionId || questions.indexOf(q) === questionId);
    
    if (!question) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Question not found' 
        },
        { status: 404 }
      );
    }

    // Cek apakah jawaban benar
    const isCorrect = selectedAnswer === question.correct;
    
    // Hitung skor berdasarkan waktu tersisa (bonus untuk jawaban cepat)
    let score = 0;
    if (isCorrect) {
      score = Math.max(10, 10 + Math.floor(timeRemaining / 3)); // Base score 10, bonus hingga 20
    }

    // Simpan ke history (dalam aplikasi nyata, simpan ke database)
    const answerRecord = {
      id: Date.now(),
      sessionId: sessionId || 'anonymous',
      questionId,
      selectedAnswer,
      correctAnswer: question.correct,
      isCorrect,
      score,
      timeRemaining,
      timestamp: new Date().toISOString()
    };

    scoreHistory.push(answerRecord);

    // Response dengan detail jawaban
    return NextResponse.json({
      success: true,
      data: {
        isCorrect,
        score,
        explanation: question.explanation,
        correctAnswer: question.correct,
        selectedAnswer,
        timeBonus: Math.floor(timeRemaining / 3),
        question: question.question
      },
      message: isCorrect ? 'Jawaban benar!' : 'Jawaban salah!'
    });

  } catch (error) {
    console.error('Error in cekjawaban API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Terjadi kesalahan pada server'
      },
      { status: 500 }
    );
  }
}

// GET method untuk mendapatkan statistik jawaban
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    let filteredHistory = scoreHistory;
    
    if (sessionId) {
      filteredHistory = scoreHistory.filter(record => record.sessionId === sessionId);
    }

    // Hitung statistik
    const totalQuestions = filteredHistory.length;
    const correctAnswers = filteredHistory.filter(record => record.isCorrect).length;
    const totalScore = filteredHistory.reduce((sum, record) => sum + record.score, 0);
    const averageTime = filteredHistory.reduce((sum, record) => sum + (30 - record.timeRemaining), 0) / totalQuestions || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        totalScore,
        averageScore: totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0,
        averageTimeUsed: Math.round(averageTime),
        history: filteredHistory.slice(-10) // 10 record terakhir
      }
    });

  } catch (error) {
    console.error('Error in GET cekjawaban API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}