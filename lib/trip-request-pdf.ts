function pdfText(value: string) {
  return value
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
  ].slice(0, 42);
  const content = [
    "BT",
    "/F1 20 Tf",
    "48 748 Td",
    `(${pdfText(lines[0])}) Tj`,
    "/F1 16 Tf",
    "0 -30 Td",
    `(${pdfText(lines[1])}) Tj`,
    "/F1 10 Tf",
    "0 -30 Td",
    ...lines.slice(3).flatMap((line) => [`(${pdfText(line)}) Tj`, "0 -15 Td"]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
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
