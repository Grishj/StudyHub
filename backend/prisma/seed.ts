import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...\n');

  // ==================== CATEGORIES ====================
  console.log('📚 Seeding Categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'NRB' },
      update: {},
      create: {
        name: 'NRB',
        description: 'Nepal Rastra Bank - Central Bank of Nepal',
        icon: '🏦',
      },
    }),
    prisma.category.upsert({
      where: { name: 'NTC' },
      update: {},
      create: {
        name: 'NTC',
        description: 'Nepal Telecom - National Telecommunications Provider',
        icon: '📱',
      },
    }),
    prisma.category.upsert({
      where: { name: 'NEA' },
      update: {},
      create: {
        name: 'NEA',
        description: 'Nepal Electricity Authority - Power Distribution',
        icon: '⚡',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Federal' },
      update: {},
      create: {
        name: 'Federal',
        description: 'Federal Public Service Commission',
        icon: '🏛️',
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // ==================== ACHIEVEMENTS ====================
  console.log('🏆 Seeding Achievements...');
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { name: 'First Steps' },
      update: {},
      create: {
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        points: 10,
        criteria: { type: 'quiz_count', value: 1 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Study Streak' },
      update: {},
      create: {
        name: 'Study Streak',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        points: 50,
        criteria: { type: 'streak', value: 7 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Quiz Master' },
      update: {},
      create: {
        name: 'Quiz Master',
        description: 'Score 100% in any quiz',
        icon: '💯',
        points: 100,
        criteria: { type: 'perfect_score', value: 100 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Knowledge Sharer' },
      update: {},
      create: {
        name: 'Knowledge Sharer',
        description: 'Upload 10 notes',
        icon: '📚',
        points: 75,
        criteria: { type: 'notes_count', value: 10 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Helpful Hand' },
      update: {},
      create: {
        name: 'Helpful Hand',
        description: 'Get 50 upvotes on your content',
        icon: '👍',
        points: 150,
        criteria: { type: 'upvotes', value: 50 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Month Warrior' },
      update: {},
      create: {
        name: 'Month Warrior',
        description: 'Maintain a 30-day streak',
        icon: '🎖️',
        points: 300,
        criteria: { type: 'streak', value: 30 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Quiz Enthusiast' },
      update: {},
      create: {
        name: 'Quiz Enthusiast',
        description: 'Complete 50 quizzes',
        icon: '📝',
        points: 200,
        criteria: { type: 'quiz_count', value: 50 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Point Collector' },
      update: {},
      create: {
        name: 'Point Collector',
        description: 'Earn 1000 points',
        icon: '💰',
        points: 0,
        criteria: { type: 'points', value: 1000 },
      },
    }),
  ]);
  console.log(`✅ Created ${achievements.length} achievements\n`);

  // ==================== USERS ====================
  console.log('👥 Seeding Users...');
  const hashedPassword = await hashPassword('Password123');

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@pscstudy.com' },
      update: {},
      create: {
        email: 'admin@pscstudy.com',
        password: hashedPassword,
        fullName: 'Admin User',
        bio: 'System Administrator',
        isEmailVerified: true,
        profile: {
          create: {
            targetExam: 'Federal',
            points: 1000,
            streak: 15,
            phone: '+977-9841234567',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'demo@pscstudy.com' },
      update: {},
      create: {
        email: 'demo@pscstudy.com',
        password: hashedPassword,
        fullName: 'Demo User',
        bio: 'Demo account for testing features',
        isEmailVerified: true,
        profile: {
          create: {
            targetExam: 'NRB',
            points: 250,
            streak: 5,
            phone: '+977-9851234567',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student1@pscstudy.com' },
      update: {},
      create: {
        email: 'student1@pscstudy.com',
        password: hashedPassword,
        fullName: 'Rajesh Sharma',
        bio: 'Preparing for NRB exam',
        isEmailVerified: true,
        profile: {
          create: {
            targetExam: 'NRB',
            points: 500,
            streak: 10,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student2@pscstudy.com' },
      update: {},
      create: {
        email: 'student2@pscstudy.com',
        password: hashedPassword,
        fullName: 'Sita Adhikari',
        bio: 'NEA aspirant',
        isEmailVerified: true,
        profile: {
          create: {
            targetExam: 'NEA',
            points: 350,
            streak: 7,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student3@pscstudy.com' },
      update: {},
      create: {
        email: 'student3@pscstudy.com',
        password: hashedPassword,
        fullName: 'Krishna Thapa',
        bio: 'NTC preparation',
        isEmailVerified: true,
        profile: {
          create: {
            targetExam: 'NTC',
            points: 420,
            streak: 8,
          },
        },
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} users\n`);

  // ==================== SYLLABUS ====================
  console.log('📖 Seeding Syllabus...');
  const nrbCategory = categories.find((c) => c.name === 'NRB');
  
  if (nrbCategory) {
    await prisma.syllabus.createMany({
      data: [
        {
          categoryId: nrbCategory.id,
          title: 'Introduction to Banking',
          description: 'Basic concepts of banking and financial institutions',
          content: 'This module covers the fundamental principles of banking...',
          order: 0,
          isPublished: true,
        },
        {
          categoryId: nrbCategory.id,
          title: 'Monetary Policy',
          description: 'Understanding monetary policy and its implementation',
          content: 'Monetary policy is the process by which the central bank...',
          order: 1,
          isPublished: true,
        },
        {
          categoryId: nrbCategory.id,
          title: 'Financial Markets',
          description: 'Overview of financial markets in Nepal',
          content: 'Financial markets play a crucial role in the economy...',
          order: 2,
          isPublished: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created syllabus for NRB\n');
  }

  // ==================== NOTES ====================
  console.log('📝 Seeding Notes...');
  const demoUser = users.find((u) => u.email === 'demo@pscstudy.com');
  const student1 = users.find((u) => u.email === 'student1@pscstudy.com');

  if (demoUser && nrbCategory) {
    await prisma.note.createMany({
      data: [
        {
          userId: demoUser.id,
          categoryId: nrbCategory.id,
          title: 'Key Banking Concepts',
          content: 'Important concepts every banking aspirant should know:\n1. Cash Reserve Ratio\n2. Statutory Liquidity Ratio\n3. Repo Rate...',
          tags: ['banking', 'concepts', 'basics'],
          fileType: 'text',
          upvotes: 15,
          downvotes: 2,
          isApproved: true,
          viewCount: 120,
        },
        {
          userId: demoUser.id,
          categoryId: nrbCategory.id,
          title: 'Monetary Policy Tools',
          content: 'The central bank uses various tools to implement monetary policy...',
          tags: ['monetary-policy', 'nrb', 'economics'],
          fileType: 'text',
          upvotes: 23,
          downvotes: 1,
          isApproved: true,
          viewCount: 180,
        },
      ],
      skipDuplicates: true,
    });
  }

  if (student1 && nrbCategory) {
    await prisma.note.createMany({
      data: [
        {
          userId: student1.id,
          categoryId: nrbCategory.id,
          title: 'Nepal Rastra Bank - History',
          content: 'Nepal Rastra Bank was established in 1956 AD...',
          tags: ['history', 'nrb', 'nepal'],
          fileType: 'text',
          upvotes: 10,
          downvotes: 0,
          isApproved: true,
          viewCount: 95,
        },
      ],
      skipDuplicates: true,
    });
  }
  console.log('✅ Created sample notes\n');

  // ==================== QUESTIONS ====================
  console.log('❓ Seeding Questions...');
  if (demoUser && nrbCategory) {
    await prisma.question.createMany({
      data: [
        {
          userId: demoUser.id,
          categoryId: nrbCategory.id,
          title: 'What is the main function of Nepal Rastra Bank?',
          content: 'Explain the primary roles and responsibilities of NRB as the central bank of Nepal.',
          year: 2023,
          tags: ['nrb', 'functions', 'exam'],
          upvotes: 8,
          downvotes: 0,
          isApproved: true,
          viewCount: 65,
        },
        {
          userId: demoUser.id,
          categoryId: nrbCategory.id,
          title: 'Explain Cash Reserve Ratio',
          content: 'What is CRR and how does it affect the banking system?',
          year: 2022,
          tags: ['crr', 'banking', 'monetary-policy'],
          upvotes: 12,
          downvotes: 1,
          isApproved: true,
          viewCount: 88,
        },
      ],
      skipDuplicates: true,
    });
  }
  console.log('✅ Created sample questions\n');

  // ==================== QUIZZES ====================
  console.log('🎯 Seeding Quizzes...');
  if (nrbCategory) {
    const quiz = await prisma.quiz.create({
      data: {
        categoryId: nrbCategory.id,
        title: 'Banking Basics Quiz',
        description: 'Test your knowledge on basic banking concepts',
        difficulty: 'easy',
        timeLimit: 15,
        isDaily: false,
        isPublished: true,
        questions: {
          create: [
            {
              question: 'What does NRB stand for?',
              options: [
                'Nepal Rastra Bank',
                'National Reserve Bank',
                'Nepal Reserve Bank',
                'National Rastra Bank',
              ],
              correctAnswer: 'Nepal Rastra Bank',
              explanation: 'NRB stands for Nepal Rastra Bank, the central bank of Nepal.',
              points: 1,
              order: 0,
            },
            {
              question: 'In which year was Nepal Rastra Bank established?',
              options: ['1956', '1960', '1950', '1965'],
              correctAnswer: '1956',
              explanation: 'Nepal Rastra Bank was established in 1956 AD.',
              points: 1,
              order: 1,
            },
            {
              question: 'What is the primary function of a central bank?',
              options: [
                'Provide loans to individuals',
                'Regulate monetary policy',
                'Sell insurance',
                'Manage stock markets',
              ],
              correctAnswer: 'Regulate monetary policy',
              explanation: 'The primary function of a central bank is to regulate monetary policy.',
              points: 1,
              order: 2,
            },
            {
              question: 'What does CRR stand for in banking?',
              options: [
                'Cash Reserve Ratio',
                'Credit Reserve Ratio',
                'Current Reserve Ratio',
                'Capital Reserve Ratio',
              ],
              correctAnswer: 'Cash Reserve Ratio',
              explanation: 'CRR stands for Cash Reserve Ratio.',
              points: 1,
              order: 3,
            },
            {
              question: 'Which of the following is NOT a function of NRB?',
              options: [
                'Issue currency',
                'Regulate banks',
                'Provide personal loans',
                'Manage foreign exchange',
              ],
              correctAnswer: 'Provide personal loans',
              explanation: 'NRB does not provide personal loans; that is the function of commercial banks.',
              points: 1,
              order: 4,
            },
          ],
        },
      },
    });

    // Create a daily quiz
    await prisma.quiz.create({
      data: {
        categoryId: nrbCategory.id,
        title: 'Daily Banking Challenge',
        description: 'Today\'s daily quiz on banking fundamentals',
        difficulty: 'medium',
        timeLimit: 10,
        isDaily: true,
        isPublished: true,
        date: new Date(),
        questions: {
          create: [
            {
              question: 'What is inflation?',
              options: [
                'Decrease in prices',
                'Increase in general price level',
                'Stable prices',
                'Currency devaluation',
              ],
              correctAnswer: 'Increase in general price level',
              explanation: 'Inflation is the rate at which the general level of prices for goods and services rises.',
              points: 2,
              order: 0,
            },
            {
              question: 'What is the repo rate?',
              options: [
                'Rate at which commercial banks lend to customers',
                'Rate at which central bank lends to commercial banks',
                'Interest rate on savings',
                'Foreign exchange rate',
              ],
              correctAnswer: 'Rate at which central bank lends to commercial banks',
              explanation: 'Repo rate is the rate at which the central bank lends money to commercial banks.',
              points: 2,
              order: 1,
            },
          ],
        },
      },
    });

    console.log('✅ Created sample quizzes with questions\n');
  }

  // ==================== GROUPS ====================
  console.log('👥 Seeding Groups...');
  const group1 = await prisma.group.create({
    data: {
      name: 'NRB Aspirants 2024',
      description: 'Group for students preparing for NRB exam',
      type: 'public',
      category: 'NRB',
      members: {
        create: [
          {
            userId: demoUser!.id,
            role: 'admin',
          },
          {
            userId: student1!.id,
            role: 'member',
          },
        ],
      },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: 'General Study Group',
      description: 'Discussion group for all PSC exams',
      type: 'public',
      category: 'General',
      members: {
        create: [
          {
            userId: users[0].id,
            role: 'admin',
          },
          {
            userId: demoUser!.id,
            role: 'moderator',
          },
          {
            userId: student1!.id,
            role: 'member',
          },
        ],
      },
    },
  });

  console.log('✅ Created sample groups\n');

  // ==================== SUMMARY ====================
  console.log('📊 Seeding Summary:');
  console.log('==================');
  console.log(`✅ Categories: ${categories.length}`);
  console.log(`✅ Achievements: ${achievements.length}`);
  console.log(`✅ Users: ${users.length}`);
  console.log(`✅ Groups: 2`);
  console.log(`✅ Quizzes: 2 (including 1 daily)`);
  console.log('✅ Notes, Questions, and Syllabus added');
  console.log('\n🎉 Seeding completed successfully!\n');

  console.log('📝 Test Credentials:');
  console.log('==================');
  console.log('Email: demo@pscstudy.com');
  console.log('Password: Password123');
  console.log('==================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });