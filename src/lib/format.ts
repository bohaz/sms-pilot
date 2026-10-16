const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const pad2 = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD in the user's local time zone (toISOString would use UTC). */
export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const today = () => toDateKey(new Date());
export const monthKey = (d: string) => d.slice(0, 7);
export function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return `${MESES[mo - 1]} ${y}`;
}
export function monthShort(m: string) {
  return MESES[Number(m.split("-")[1]) - 1];
}
export function fmtDate(d?: string) {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${MESES[m - 1]} ${y}`;
}
export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(toDateKey(d))} ${hh}:${mm}`;
}
export function addDays(base: string, n: number) {
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}
export function addMonths(m: string, n: number) {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 86400000,
  );
}
/** Whole days from today until `date`; negative when it is in the past. */
export const daysUntil = (date: string, from = today()) => daysBetween(from, date);

export function toCsv(rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n");
}
export function downloadFile(name: string, content: string, mime = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
