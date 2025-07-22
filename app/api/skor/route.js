// app/api/skor/route.js

import { NextResponse } from 'next/server';

// Simulasi database skor
let scores = [
  {
    id: 1,
    sessionId: 'demo-session-1',
    playerName: 'Ahmad',
    totalQuestions: 5,
    correctAnswers: 4,
    totalScore: 85,
    completedAt: '2024-01-15T10:30:00Z',
    duration: 120,
    difficulty: 'mudah'
  },
  {
    id: 2,
    sessionId: 'demo-session-2',
    playerName: 'Sari',
    totalQuestions: 5,
    correctAnswers: 5,
    totalScore: 100,
    completedAt: '2024-01-15T11:15:00Z',
    duration: 95,
    difficulty: 'mudah'
  }
];

// GET - Ambil daftar skor / leaderboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'totalScore'; // totalScore, completedAt, duration
    const order = searchParams.get('order') || 'desc'; // desc, asc

    let filteredScores = [...scores];

    // Filter berdasarkan session ID jika diminta
    if (sessionId) {
      filteredScores = filteredScores.filter(score => score.sessionId === sessionId);
    }

    // Sorting
    filteredScores.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'totalScore':
          comparison = a.totalScore - b.totalScore;
          break;
        case 'completedAt':
          comparison = new Date(a.completedAt) - new Date(b.completedAt);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'correctAnswers':
          comparison = a.correctAnswers - b.correctAnswers;
          break;
        default:
          comparison = a.totalScore - b.totalScore;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    // Batasi hasil
    const paginatedScores = filteredScores.slice(0, limit);

    // Hitung statistik
    const totalPlayers = filteredScores.length;
    const averageScore = totalPlayers > 0 
      ? Math.round(filteredScores.reduce((sum, score) => sum + score.totalScore, 0) / totalPlayers)
      : 0;
    const highestScore = totalPlayers > 0 
      ? Math.max(...filteredScores.map(score => score.totalScore))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        scores: paginatedScores,
        statistics: {
          totalPlayers,
          averageScore,
          highestScore,
          perfectScores: filteredScores.filter(score => score.totalScore === 100).length
        }
      },
      message: 'Scores retrieved successfully'
    });

  } catch (error) {
    console.error('Error in GET scores API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST - Simpan skor baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      sessionId, 
      playerName, 
      totalQuestions, 
      correctAnswers, 
      totalScore, 
      duration,
      difficulty,
      answers // array detail jawaban
    } = body;

    // Validasi input
    if (!sessionId || !totalQuestions || correctAnswers === undefined || totalScore === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: sessionId, totalQuestions, correctAnswers, totalScore' 
        },
        { status: 400 }
      );
    }

    if (correctAnswers > totalQuestions) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Correct answers cannot exceed total questions' 
        },
        { status: 400 }
      );
    }

    // Hitung akurasi
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    // Tentukan grade berdasarkan skor
    let grade = 'D';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';

    // Buat record skor baru
    const newScore = {
      id: Math.max(...scores.map(s => s.id), 0) + 1,
      sessionId,
      playerName: playerName || 'Anonymous',
      totalQuestions,
      correctAnswers,
      totalScore,
      accuracy,
      grade,
      duration: duration || 0,
      difficulty: difficulty || 'mudah',
      completedAt: new Date().toISOString(),
      answers: answers || []
    };

    scores.push(newScore);

    // Cek apakah ini skor terbaik untuk session ini
    const sessionScores = scores.filter(s => s.sessionId === sessionId);
    const isPersonalBest = sessionScores.length === 1 || 
      totalScore > Math.max(...sessionScores.slice(0, -1).map(s => s.totalScore));

    // Cek peringkat global
    const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);
    const globalRank = sortedScores.findIndex(s => s.id === newScore.id) + 1;

    return NextResponse.json({
      success: true,
      data: {
        ...newScore,
        isPersonalBest,
        globalRank,
        totalPlayers: scores.length
      },
      message: 'Score saved successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST scores API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus skor (untuk admin atau reset personal data)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const scoreId = searchParams.get('scoreId');

    if (!sessionId && !scoreId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either sessionId or scoreId is required' 
        },
        { status: 400 }
      );
    }

    const initialLength = scores.length;

    if (scoreId) {
      // Hapus skor spesifik berdasarkan ID
      scores = scores.filter(score => score.id !== parseInt(scoreId));
    } else if (sessionId) {
      // Hapus semua skor untuk session tertentu
      scores = scores.filter(score => score.sessionId !== sessionId);
    }

    const deletedCount = initialLength - scores.length;

    if (deletedCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No scores found to delete' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedCount
      },
      message: `${deletedCount} score(s) deleted successfully`
    });

  } catch (error) {
    console.error('Error in DELETE scores API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}