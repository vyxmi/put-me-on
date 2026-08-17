/** Full-page noise texture, applied once at the root. Deliberately faint —
 * "a small amount of imperfection," not a filter. */
export function Grain() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
