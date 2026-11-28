export type Lead = {
  name: string; email: string; phone: string; dateMode: "" | "exact" | "approximate" | "flexible";
  startDate: string; endDate: string; preferredPeriod: string; adults: number | null;
  budget: number | null; preferences: string; locale: "en" | "ru";
};
const controls = /[\u0000-\u001f\u007f]/;
export function validEmail(value: string) {
  return value.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(value);
}
export function validateLead(input: Record<string, unknown>) {
  const errors = new Set<string>();
  const read = (key: string, max: number, error = key, multiline = false) => {
    const raw = input[key];
    if (raw === null || raw === undefined) return "";
    if (typeof raw !== "string") { errors.add(error); return ""; }
    const value = raw.trim();
    if (value.length > max || controls.test(multiline ? value.replace(/[\r\n\t]/g, "") : value)) errors.add(error);
    return value;
  };
  const name = read("name", 120);
  const email = read("email", 254);
  if (!name) errors.add("name");
  if (!validEmail(email)) errors.add("email");
  const phone = read("phone", 30, "contact");
  if (phone && !/^\+?[\d ()-]{7,30}$/.test(phone)) errors.add("contact");
  const mode = input.dateMode ?? "";
  if (!["", "exact", "approximate", "flexible"].includes(String(mode))) errors.add("dates");
  const startDate = read("startDate", 10, "dates");
  const endDate = read("endDate", 10, "dates");
  const preferredPeriod = read("preferredPeriod", 80, "dates");
  const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
  if (mode === "exact") {
    if (!validDate(startDate) || !validDate(endDate) || startDate > endDate || startDate < new Date().toISOString().slice(0, 10)) errors.add("dates");
  } else if (startDate || endDate) errors.add("dates");
  if (mode === "approximate" ? !/^\d{4}-(0[1-9]|1[0-2])$/.test(preferredPeriod) : Boolean(preferredPeriod)) errors.add("dates");
  const optionalNumber = (key: string, error: string, max: number, integer = false) => {
    const value = input[key];
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max ||
        (integer ? !Number.isInteger(value) : Math.abs(value * 100 - Math.round(value * 100)) > 0.000001)) {
      errors.add(error); return null;
    }
    return value;
  };
  const adults = optionalNumber("adults", "travelers", 100, true);
  const budget = optionalNumber("budget", "budget", 99999999.99);
  const preferences = read("preferences", 3000, "preferences", true);
  const data: Lead = { name, email, phone, dateMode: mode as Lead["dateMode"], startDate, endDate, preferredPeriod,
    adults, budget, preferences, locale: input.locale === "ru" ? "ru" : "en" };
  return { data, errors: [...errors] };
}
