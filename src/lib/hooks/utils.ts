/**
 * Returns a Promise that rejects after `ms` milliseconds.
 * Reuse the same instance across multiple awaits in a single load() call
 * so the budget is shared (e.g. two sequential queries share 5 s total).
 */
export function makeDeadline(ms = 5000): Promise<never> {
  return new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Délai dépassé (${ms / 1000}s) — vérifiez votre connexion`)),
      ms,
    ),
  );
}
