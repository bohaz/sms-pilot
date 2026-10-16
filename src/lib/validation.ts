// Form rules. Each validator returns an error message in Spanish, or null when valid.

export const LIMITS = {
  reportDescription: 15,
  title: 5,
  closureEvidence: 10,
};

export function validateReport(input: { description: string; date: string }, today: string) {
  if (input.description.trim().length < LIMITS.reportDescription)
    return `Describa lo ocurrido con al menos ${LIMITS.reportDescription} caracteres.`;
  if (input.date > today) return "La fecha no puede ser futura.";
  return null;
}

export function validateTitle(title: string) {
  if (title.trim().length < LIMITS.title)
    return `Escriba un título de al menos ${LIMITS.title} caracteres.`;
  return null;
}

export function validateAction(input: { title: string; dueDate: string }, today: string) {
  const titleError = validateTitle(input.title);
  if (titleError) return titleError;
  if (input.dueDate < today) return "La fecha límite no puede estar en el pasado.";
  return null;
}

export function validateClosure(evidence: string) {
  if (evidence.trim().length < LIMITS.closureEvidence)
    return `Describa la evidencia de cierre (mínimo ${LIMITS.closureEvidence} caracteres).`;
  return null;
}
