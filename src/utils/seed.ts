// generate faculties

import { academicYear, faculty, user } from '../db/schema';
import { db } from '../db/';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const faculties = [
  {
    name: 'Faculty of Science',
  },
  {
    name: 'Faculty of Engineering',
  },
  {
    name: 'Faculty of Business',
  },
  {
    name: 'Faculty of Arts',
  },
  {
    name: 'Faculty of Law',
  },
  {
    name: 'Faculty of Medicine',
  },
  {
    name: 'Faculty of Education',
  },
];

export const generateFaculties = async () => {
  faculties.forEach(async (item) => {
    // check if faculty already exists
    const facultyExists = await db
      .select()
      .from(faculty)
      .where(eq(faculty.name, item.name));
    if (facultyExists.length > 0) {
      return;
    }
    await db.insert(faculty).values(item);
  });
};

export const generateAcademicYears = async () => {
  const academicYears = [
    {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      newClosureDate: new Date('2024-06-01'),
      finalClosureDate: new Date('2024-07-01'),
    },
  ];
  academicYears.forEach(async (item) => {
    await db.insert(academicYear).values(item);
  });
};

export const seedAdminUser = async () => {
  const adminUser = {
    email: 'admin@gmail.com',
    password: 'admin',
    name: 'Admin User',
    role: 'admin' as const,
  };
  // check if user already exists
  const userExists = await db
    .select()
    .from(user)
    .where(eq(user.email, adminUser.email));
  if (userExists.length > 0) {
    return;
  }
  // get faculty id
  const adminFaculty = await db
    .select()
    .from(faculty)
    .where(eq(faculty.name, 'Faculty of Science'));
  // hash password
  const hashedPassword = await bcrypt.hash(adminUser.password, 10);
  await db.insert(user).values({
    email: adminUser.email,
    name: adminUser.name,
    passwordHash: hashedPassword,
    role: adminUser.role,
    facultyId: adminFaculty[0].id,
  });
};

export const seedStudentUsers = async () => {
  const studentUsers = [
    {
      email: 'student1@gmail.com',
      password: 'student1',
      name: 'Student One',
      role: 'student' as const,
    },
    {
      email: 'student2@gmail.com',
      password: 'student2',
      name: 'Student Two',
      role: 'student' as const,
    },
    {
      email: 'student3@gmail.com',
      password: 'student3',
      name: 'Student Three',
      role: 'student' as const,
    },
  ];
  studentUsers.forEach(async (item) => {
    // check if user already exists
    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.email, item.email));
    if (userExists.length > 0) {
      return;
    }
    // hash password
    const hashedPassword = await bcrypt.hash(item.password, 10);
    // get random faculty id
    const randomNumber = Math.floor(Math.random() * faculties.length);
    const randomFaculty = await db
      .select()
      .from(faculty)
      .where(eq(faculty.name, faculties[randomNumber].name))
      .limit(1);
    await db.insert(user).values({
      email: item.email,
      name: item.name,
      passwordHash: hashedPassword,
      role: item.role,
      facultyId: randomFaculty[0].id,
    });
  });
};
