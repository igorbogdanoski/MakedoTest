/**
 * Zod-based request body validation middleware.
 *
 * Usage:
 *   router.post('/rag/index', validateBody(IndexRequestSchema), handler);
 *
 * On failure: responds 400 with { ok: false, error, issues }.
 */

/**
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        ok: false,
        error: 'Invalid request body',
        issues: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    req.validatedBody = result.data;
    next();
  };
}
