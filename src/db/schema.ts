import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  date,
} from 'drizzle-orm/pg-core';

export const userRolesEnum = pgEnum('user_roles', [
  'guest',
  'student',
  'marketing_coordinator',
  'marketing_manager',
  'admin',
]);

export const user = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    role: userRolesEnum('role').notNull().default('guest'),
    facultyId: uuid('faculty_id').references(() => faculty.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (users) => [
    // Add index for email
    index().on(users.email),
    index().on(users.facultyId),
  ],
);

export const faculty = pgTable(
  'faculties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (faculties) => [index().on(faculties.name)],
);

export const academicYear = pgTable('academic_years', {
  id: uuid('id').primaryKey().defaultRandom(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  newClosureDate: timestamp('new_closure_date', {
    withTimezone: true,
  }).notNull(),
  finalClosureDate: timestamp('final_closure_date', {
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const term = pgTable('terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contributionStatusEnum = pgEnum('contribution_status', [
  'pending',
  'selected',
  'rejected',
]);

export const contribution = pgTable(
  'contributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    studentId: uuid('student_id')
      .references(() => user.id)
      .notNull(),
    academicYearId: uuid('academic_year_id')
      .references(() => academicYear.id)
      .notNull(),
    facultyId: uuid('faculty_id')
      .references(() => faculty.id)
      .notNull(),
    submissionDate: timestamp('submission_date', {
      withTimezone: true,
    }).notNull(),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
    status: contributionStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (contributions) => [
    index().on(contributions.studentId),
    index().on(contributions.academicYearId),
    index().on(contributions.facultyId),
  ],
);

export const contributionAssetTypeEnum = pgEnum('contribution_asset_type', [
  'article',
  'image',
]);

export const contributionAsset = pgTable(
  'contribution_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contributionId: uuid('contribution_id')
      .references(() => contribution.id)
      .notNull(),
    type: contributionAssetTypeEnum('type').notNull(),
    filePath: text('file_path').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (contributionAssets) => [index().on(contributionAssets.contributionId)],
);

export const comment = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contributionId: uuid('contribution_id')
      .references(() => contribution.id)
      .notNull(),
    content: text('content').notNull(),
    userId: uuid('user_id')
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (comments) => [
    index().on(comments.contributionId),
    index().on(comments.userId),
  ],
);
