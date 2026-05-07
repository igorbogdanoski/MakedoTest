/**
 * Канонски domain модел за МакедоТест прашања и тестови.
 *
 * Целта на овој модул е:
 *   1. Single source of truth за валидните полиња на секое прашање.
 *   2. Runtime валидација на AI/JSON импорти (паста на JSON, QTI, Vision).
 *   3. Безбедна основа за идна TypeScript миграција (генерирање `.d.ts` од Zod).
 *
 * Поддржани типови (синхронизирани со AI_IMPORT_PROMPT.md):
 *   multiple, true-false, fill-blanks, matching, list, short-answer, checklist,
 *   table, multi-part, ordering, essay, diagram, statements, selection,
 *   multi-match, section
 */

import { z } from 'zod';

export const QUESTION_TYPES = [
  'multiple',
  'true-false',
  'fill-blanks',
  'matching',
  'list',
  'short-answer',
  'checklist',
  'table',
  'multi-part',
  'ordering',
  'essay',
  'diagram',
  'statements',
  'selection',
  'multi-match',
  'section',
];

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const baseFields = {
  id: z.string().optional(),
  text: z.string().default(''),
  points: z.number().int().nonnegative().optional(),
  difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
  fullWidth: z.boolean().optional(),
  qrUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  estimatedTime: z.number().nonnegative().optional(),
  bloomLevel: z
    .enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])
    .optional(),
};

export const MultipleSchema = z.object({
  ...baseFields,
  type: z.literal('multiple'),
  options: z.array(z.string()).min(2),
  correct: z.number().int().nonnegative(),
});

export const TrueFalseSchema = z.object({
  ...baseFields,
  type: z.literal('true-false'),
  correct: z.union([z.literal(0), z.literal(1)]),
});

export const FillBlanksSchema = z.object({
  ...baseFields,
  type: z.literal('fill-blanks'),
});

export const MatchingSchema = z.object({
  ...baseFields,
  type: z.literal('matching'),
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(1),
});

export const ListSchema = z.object({
  ...baseFields,
  type: z.literal('list'),
  items: z.array(z.string()).min(1),
});

export const ShortAnswerSchema = z.object({
  ...baseFields,
  type: z.literal('short-answer'),
});

export const ChecklistSchema = z.object({
  ...baseFields,
  type: z.literal('checklist'),
  options: z.array(z.string()).min(2),
  corrects: z.array(z.number().int().nonnegative()).min(1),
});

export const TableCellSchema = z.object({
  val: z.string().default(''),
  isAns: z.boolean().optional(),
});

export const TableSchema = z.object({
  ...baseFields,
  type: z.literal('table'),
  tableData: z.object({
    rows: z.number().int().positive(),
    cols: z.number().int().positive(),
    data: z.record(z.string(), TableCellSchema).default({}),
  }),
});

export const MultiPartSchema = z.object({
  ...baseFields,
  type: z.literal('multi-part'),
  parts: z.array(z.string()).min(1),
});

export const OrderingSchema = z.object({
  ...baseFields,
  type: z.literal('ordering'),
  items: z.array(z.string()).min(2),
});

export const EssaySchema = z.object({
  ...baseFields,
  type: z.literal('essay'),
});

export const DiagramSchema = z.object({
  ...baseFields,
  type: z.literal('diagram'),
  embedType: z.enum(['image', 'geogebra', 'desmos']).optional(),
  embedUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});

export const StatementsSchema = z.object({
  ...baseFields,
  type: z.literal('statements'),
  items: z
    .array(z.object({ s: z.string(), correct: z.union([z.literal(0), z.literal(1)]) }))
    .min(1),
});

export const SelectionSchema = z.object({
  ...baseFields,
  type: z.literal('selection'),
});

export const MultiMatchSchema = z.object({
  ...baseFields,
  type: z.literal('multi-match'),
  matches: z.array(z.object({ s: z.string(), a: z.string() })).min(1),
});

export const SectionSchema = z.object({
  ...baseFields,
  type: z.literal('section'),
});

/** Дискриминирана унија за сите типови прашања. */
export const QuestionSchema = z.discriminatedUnion('type', [
  MultipleSchema,
  TrueFalseSchema,
  FillBlanksSchema,
  MatchingSchema,
  ListSchema,
  ShortAnswerSchema,
  ChecklistSchema,
  TableSchema,
  MultiPartSchema,
  OrderingSchema,
  EssaySchema,
  DiagramSchema,
  StatementsSchema,
  SelectionSchema,
  MultiMatchSchema,
  SectionSchema,
]);

/** Колекција на прашања (произлегува од AI/JSON paste import). */
export const QuestionListSchema = z.array(QuestionSchema);

/** Целосен тест (метаподатоци + прашања). */
export const TestSchema = z.object({
  id: z.string().optional(),
  title: z.string().default(''),
  subject: z.string().optional(),
  grade: z.string().optional(),
  language: z.enum(['mk', 'sq']).default('mk'),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional(),
  questions: QuestionListSchema.default([]),
});

/**
 * Безбедно парсира корисничкиот JSON и враќа резултат.
 * @param {unknown} input
 * @returns {{ success: true, data: import('zod').infer<typeof QuestionListSchema> }
 *         | { success: false, error: import('zod').ZodError }}
 */
export function parseQuestionList(input) {
  return QuestionListSchema.safeParse(input);
}

/**
 * Безбедно парсира тест.
 * @param {unknown} input
 */
export function parseTest(input) {
  return TestSchema.safeParse(input);
}
