const cyrillicToLatin: Record<string, string> = { А: "A", а: "a", Б: "B", б: "b", В: "V", в: "v", Г: "G", г: "g", Д: "D", д: "d", Е: "E", е: "e", Ё: "Yo", ё: "yo", Ж: "Zh", ж: "zh", З: "Z", з: "z", И: "I", и: "i", Й: "Y", й: "y", К: "K", к: "k", Л: "L", л: "l", М: "M", м: "m", Н: "N", н: "n", О: "O", о: "o", П: "P", п: "p", Р: "R", р: "r", С: "S", с: "s", Т: "T", т: "t", У: "U", у: "u", Ф: "F", ф: "f", Х: "Kh", х: "kh", Ц: "Ts", ц: "ts", Ч: "Ch", ч: "ch", Ш: "Sh", ш: "sh", Щ: "Shch", щ: "shch", Ъ: "", ъ: "", Ы: "Y", ы: "y", Ь: "", ь: "", Э: "E", э: "e", Ю: "Yu", ю: "yu", Я: "Ya", я: "ya" };
function pdfText(value: string) {
  return value
    .replace(/[А-Яа-яЁё]/g, (character) => cyrillicToLatin[character] ?? character)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap(value: string, width = 78) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A compact, dependency-free PDF attachment for planner requests. */
export function buildTripRequestPdf(summary: string) {
  const lines = [
    "KYRGYZSTAN360",
    "Your trip request",
    "",
    ...wrap("Thank you for sharing your travel wishes. A local guide will review the details below and contact you with a tailored route and price."),
    "",
    ...summary.split("\n").flatMap((line) => wrap(line)),
    "",
    "This is a trip request, not a confirmed booking or itinerary.",
  ];
  const chunks = Array.from({ length: Math.max(1, Math.ceil(lines.length / 42)) }, (_, index) => lines.slice(index * 42, index * 42 + 42));
  const pageObjectNumbers = chunks.map((_, index) => 4 + index * 2);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${chunks.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...chunks.flatMap((pageLines, index) => {
      const content = index === 0 ? ["BT", "/F1 20 Tf", "48 748 Td", `(${pdfText(pageLines[0] ?? "KYRGYZSTAN360")}) Tj`, "/F1 16 Tf", "0 -30 Td", `(${pdfText(pageLines[1] ?? "Your trip request")}) Tj`, "/F1 10 Tf", "0 -30 Td", ...pageLines.slice(3).flatMap((line) => [`(${pdfText(line)}) Tj`, "0 -15 Td"]), "ET"].join("\n") : ["BT", "/F1 10 Tf", "48 748 Td", ...pageLines.flatMap((line) => [`(${pdfText(line)}) Tj`, "0 -15 Td"]), "ET"].join("\n");
      const pageNumber = pageObjectNumbers[index];
      return [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageNumber + 1} 0 R >>`, `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`];
    }),
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "ascii");
}
