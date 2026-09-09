const NO_TRACE_ID = 'no-trace-id';

/**
 * Lambda vernieuwt _X_AMZN_TRACE_ID bij elke invocation, ook op een warm container.
 * Daarom hier uitlezen en niet cachen op module niveau.
 */
export function xRayTraceId(): string {
  const header = process.env._X_AMZN_TRACE_ID;
  const match = header?.match(/Root=([^;]+)/);
  return match?.[1] ?? NO_TRACE_ID;
}
