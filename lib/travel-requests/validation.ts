export const countries = ["KG", "KZ", "UZ", "TJ", "TM"] as const;
export const interests = ["nature", "road", "hiking", "horses", "nomadic", "history", "lakes", "winter", "photo", "family", "culture"] as const;
export const statuses = ["new", "contacted", "planning", "proposal_sent", "negotiating", "booked", "completed", "lost", "cancelled"] as const;
export const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function date(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? value : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validate(input: Record<string, unknown>, step = 5) {
  const selected = input.countries;
  const selectedInterests = input.interests;
  const startDate = date(input.startDate);
  const endDate = date(input.endDate);
  const flexible = input.flexible === true;
  const adults = typeof input.adults === "number" ? input.adults : NaN;
  const children = typeof input.children === "number" ? input.children : NaN;
  const budget = typeof input.budget === "number" ? input.budget : NaN;
  const name = text(input.name);
  const email = text(input.email);
  const phone = text(input.phone);
  const telegram = text(input.telegram);
  const residence = text(input.residence);
  const preferences = text(input.preferences);
  const contact = text(input.contact);
  const errors: string[] = [];

  if (!Array.isArray(selected) || !selected.includes("KG") || selected.length > 5 ||
      selected.some((country) => !countries.some((code) => code === country))) errors.push("countries");
  if (step >= 2) {
    if ((!flexible || input.startDate || input.endDate) && (!startDate || !endDate || endDate < startDate ||
        startDate < new Date().toISOString().slice(0, 10))) errors.push("dates");
    if (!Number.isInteger(adults) || adults < 1 || adults > 100 ||
        !Number.isInteger(children) || children < 0 || children > 100) errors.push("travelers");
    if (!(budget > 0 && budget <= 99999999.99) || Number(budget.toFixed(2)) !== budget) errors.push("budget");
  }
  if (step >= 3 && (!Array.isArray(selectedInterests) || selectedInterests.length > interests.length ||
      selectedInterests.some((interest) => !interests.some((code) => code === interest)))) errors.push("interests");
  if (step >= 4 && preferences.length > 3000) errors.push("preferences");
  if (step >= 5) {
    if (!name || name.length > 120) errors.push("name");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email");
    if (residence.length > 100 || !["email", "whatsapp", "telegram"].includes(contact) ||
        (phone && !/^\+?[\d ()-]{7,30}$/.test(phone)) ||
        (contact === "whatsapp" && !/^\+[1-9]\d{6,14}$/.test(phone.replace(/[ ()-]/g, ""))) ||
        (contact === "telegram" && !/^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(telegram))) errors.push("contact");
    if (input.consent !== true) errors.push("consent");
  }
  const utm = Object.fromEntries(utmKeys.flatMap((key) => {
    const value = text((input.utm as Record<string, unknown> | null)?.[key]);
    return value ? [[key, value.slice(0, 200)]] : [];
  }));
  return { errors, data: {
    countries: countries.filter((code) => Array.isArray(selected) && selected.includes(code)),
    interests: interests.filter((code) => Array.isArray(selectedInterests) && selectedInterests.includes(code)),
    startDate, endDate, flexible, adults, children, budget, name, email, phone,
    telegram: contact === "telegram" ? telegram : "", residence, preferences, contact,
    locale: input.locale === "ru" ? "ru" : "en", consent: input.consent === true, utm,
  } };
}

export function validateTravelerUpdate(input: Record<string, unknown>) {
  const selected = input.countries;
  const selectedInterests = input.interests;
  const startDate = date(input.startDate);
  const endDate = date(input.endDate);
  const flexible = input.flexible === true;
  const adults = typeof input.adults === "number" ? input.adults : NaN;
  const children = typeof input.children === "number" ? input.children : NaN;
  const budget = typeof input.budget === "number" ? input.budget : NaN;
  const preferences = text(input.preferences);
  const errors: string[] = [];

  if (!Array.isArray(selected) || !selected.includes("KG") || selected.length > 5 ||
      new Set(selected).size !== selected.length ||
      selected.some((country) => !countries.some((code) => code === country))) errors.push("countries");
  if ((!flexible || input.startDate || input.endDate) && (!startDate || !endDate || endDate < startDate ||
      startDate < new Date().toISOString().slice(0, 10))) errors.push("dates");
  if (!Number.isInteger(adults) || adults < 1 || adults > 100 ||
      !Number.isInteger(children) || children < 0 || children > 100) errors.push("travelers");
  if (!(budget > 0 && budget <= 99999999.99) || Number(budget.toFixed(2)) !== budget) errors.push("budget");
  if (!Array.isArray(selectedInterests) || selectedInterests.length > interests.length ||
      new Set(selectedInterests).size !== selectedInterests.length ||
      selectedInterests.some((interest) => !interests.some((code) => code === interest))) errors.push("interests");
  if (preferences.length > 3000) errors.push("preferences");

  return {
    errors,
    data: {
      countries: countries.filter((code) => Array.isArray(selected) && selected.includes(code)),
      startDate: flexible ? null : startDate,
      endDate: flexible ? null : endDate,
      flexible,
      adults,
      children,
      budget,
      interests: interests.filter((code) => Array.isArray(selectedInterests) && selectedInterests.includes(code)),
      preferences,
    },
  };
}
