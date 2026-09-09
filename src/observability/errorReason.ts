// alleen de message loggen, geen stack of hele error object, om geen gevoelige data te lekken
export function errorReason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
