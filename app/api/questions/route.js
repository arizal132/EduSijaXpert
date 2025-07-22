// app/api/questions/route.js

import { NextResponse } from 'next/server';

// Simulasi database soal
const questions = [
  {
    id: 1,
    question: "Berapakah hasil dari 15 + 27?",
    options: ["40", "42", "45", "47"],
    correct: 1,
    explanation: "15 + 27 = 42",
    category: "aritmatika",
    difficulty: "mudah"
  },
  {
    id: 2,
    question: "Jika 8 × 7 = ?, maka hasilnya adalah:",
    options: ["54", "56", "58", "60"],
    correct: 1,
    explanation: "8 × 7 = 56",
    category: "perkalian",
    difficulty: "mudah"
  },
  {
    id: 3,
    question: "Berapakah 144 ÷ 12?",
    options: ["10", "11", "12", "13"],
    correct: 2,
    explanation: "144 ÷ 12 = 12",
    category: "pembagian",
    difficulty: "mudah"
  },
  {
    id: 4,
    question: "Hasil dari 25 - 18 + 9 adalah:",
    options: ["14", "16", "18", "20"],
    correct: 1,
    explanation: "25 - 18 + 9 = 7 + 9 = 16",
    category: "aritmatika",
    difficulty: "mudah"
  },
  {
    id: 5,
    question: "Jika sebuah persegi panjang memiliki panjang 8 cm dan lebar 5 cm, berapakah luasnya?",
    options: ["35 cm²", "40 cm²", "45 cm²", "50 cm²"],
    correct: 1,
    explanation: "Luas = panjang × lebar = 8 × 5 = 40 cm²",
    category: "geometri",
    difficulty: "sedang"
  },
  {
    id: 6,
    question: "Berapakah akar kuadrat dari 64?",
    options: ["6", "7", "8", "9"],
    correct: 2,
    explanation: "√64 = 8, karena 8 × 8 = 64",
    category: "akar",
    difficulty: "sedang"
  },
  {
    id: 7,
    question: "Jika x + 5 = 12, maka x = ?",
    options: ["5", "6", "7", "8"],
    correct: 2,
    explanation: "x + 5 = 12, maka x = 12 - 5 = 7",
    category: "aljabar",
    difficulty: "sedang"
  },
  {
    id: 8,
    question: "Keliling lingkaran dengan jari-jari 7 cm adalah: (π = 22/7)",
    options: ["42 cm", "44 cm", "46 cm", "48 cm"],
    correct: 1,
    explanation: "Keliling = 2πr = 2 × (22/7) × 7 = 44 cm",
    category: "geometri",
    difficulty: "sulit"
  }
];

// GET - Ambil semua soal atau filter berdasarkan kriteria
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit')) || questions.length;
    const random = searchParams.get('random') === 'true';

    let filteredQuestions = [...questions];

    // Filter berdasarkan kategori
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter berdasarkan tingkat kesulitan
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Acak urutan soal jika diminta
    if (random) {
      filteredQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
    }

    // Batasi jumlah soal
    filteredQuestions = filteredQuestions.slice(0, limit);

    // Hapus jawaban benar dari response (untuk keamanan)
    const questionsForClient = filteredQuestions.map(q => {
      const { correct, ...questionWithoutAnswer } = q;
      return questionWithoutAnswer;
    });

    return NextResponse.json({
      success: true,
      data: questionsForClient,
      total: filteredQuestions.length,
      message: 'Questions retrieved successfully'
    });

  } catch (error) {
    console.error('Error in GET questions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST - Tambah soal baru (untuk admin)
export async function POST(request) {
  try {
    const body = await request.json();
    const { question, options, correct, explanation, category, difficulty } = body;

    // Validasi input
    if (!question || !options || correct === undefined || !explanation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: question, options, correct, explanation' 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Options must be an array of 4 elements' 
        },
        { status: 400 }
      );
    }

    if (correct < 0 || correct >= options.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Correct answer index is invalid' 
        },
        { status: 400 }
      );
    }

    // Buat soal baru
    const newQuestion = {
      id: Math.max(...questions.map(q => q.id)) + 1,
      question,
      options,
      correct,
      explanation,
      category: category || 'umum',
      difficulty: difficulty || 'mudah'
    };

    questions.push(newQuestion);

    // Response tanpa jawaban benar
    const { correct: _, ...questionForResponse } = newQuestion;

    return NextResponse.json({
      success: true,
      data: questionForResponse,
      message: 'Question added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST questions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}