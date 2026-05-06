import { z } from 'zod';

export const SECONDARY_TRACKS = [
  'gymnasium',
  'gymnasium_elective',
  'vocational4',
  'vocational3',
  'vocational2',
];

export const TRACKS = ['primary', ...SECONDARY_TRACKS];

export const ConceptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  assessmentStandards: z.array(z.string().min(1)).default([]),
});

export const TopicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  suggestedHours: z.number().int().positive().optional(),
  concepts: z.array(ConceptSchema).min(1),
});

export const GradeSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().min(1).max(13),
  title: z.string().min(1),
  weeklyHours: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  secondaryTrack: z.enum(SECONDARY_TRACKS).optional(),
  topics: z.array(TopicSchema).min(1),
});

export const TrackSnapshotSchema = z.object({
  track: z.enum(TRACKS),
  grades: z.array(GradeSchema).min(1),
});

export const CurriculumSnapshotSchema = z.object({
  version: z.string().min(1),
  source: z.object({
    repository: z.string().min(1),
    commitSha: z.string().min(7),
    extractedAt: z.string().min(1),
  }),
  tracks: z.array(TrackSnapshotSchema).min(1),
});

export function parseCurriculumSnapshot(input) {
  return CurriculumSnapshotSchema.safeParse(input);
}
