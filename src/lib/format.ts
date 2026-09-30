const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const today = () => new Date().toISOString().slice(0, 10);
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
  return `${fmtDate(iso.slice(0, 10))} ${hh}:${mm}`;
}
export function addDays(base: string, n: number) {
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
export function addMonths(m: string, n: number) {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 86400000);
}
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
