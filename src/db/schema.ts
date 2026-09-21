import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  taxId: text('tax_id').notNull(),
  type: text('type', { enum: ['MAIN_CONTRACTOR', 'SUBCONTRACTOR'] }).notNull(),
  address: text('address').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role', { enum: ['MAIN_CONTRACTOR_ADMIN', 'SITE_MANAGER', 'SUBCONTRACTOR_USER'] }).notNull(),
  companyId: text('company_id').references(() => companies.id),
  companyName: text('company_name'),
  assignedProjectIds: jsonb('assigned_project_ids').default([]),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  companyId: text('company_id').references(() => companies.id).notNull(),
  status: text('status', { enum: ['Active', 'Paused', 'Completed'] }).default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workers = pgTable('workers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  companyId: text('company_id').references(() => companies.id).notNull(),
  nationalId: text('national_id').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dailyReports = pgTable('daily_reports', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  projectNameSnapshot: text('project_name_snapshot').notNull(),
  companyId: text('company_id').references(() => companies.id).notNull(),
  creatorUserId: text('creator_user_id').references(() => users.id).notNull(),
  creatorNameSnapshot: text('creator_name_snapshot').notNull(),
  date: text('date').notNull(),
  totalHours: integer('total_hours').default(0),
  workEntries: jsonb('work_entries').default([]),
  status: text('status', { enum: ['Draft', 'Submitted', 'Validated'] }).default('Draft'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deliveryNotes = pgTable('delivery_notes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  dailyReportId: text('daily_report_id').references(() => dailyReports.id).notNull(),
  subcontractorCompanyId: text('subcontractor_company_id').references(() => companies.id).notNull(),
  subcontractorCompanyName: text('subcontractor_company_name').notNull(),
  mainContractorCompanyId: text('main_contractor_company_id').references(() => companies.id).notNull(),
  projectNameSnapshot: text('project_name_snapshot').notNull(),
  date: text('date').notNull(),
  totalHours: integer('total_hours').default(0),
  status: text('status', { enum: ['Pending', 'Confirmed', 'Disputed'] }).default('Pending'),
  confirmationDate: timestamp('confirmation_date'),
  confirmationUserId: text('confirmation_user_id').references(() => users.id),
  disputeReason: text('dispute_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  entityId: text('entity_id'),
  entityType: text('entity_type'),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  workers: many(workers),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  reportsCreated: many(dailyReports),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  reports: many(dailyReports),
}));

export const dailyReportsRelations = relations(dailyReports, ({ one, many }) => ({
  project: one(projects, {
    fields: [dailyReports.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [dailyReports.creatorUserId],
    references: [users.id],
  }),
  deliveryNotes: many(deliveryNotes),
}));
