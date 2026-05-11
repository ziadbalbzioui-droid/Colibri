export function validateIban(value: string): string | null {
  const clean = value.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(clean)) return "L'IBAN doit commencer par un code pays (ex : FR76…)";
  if (clean.length < 15 || clean.length > 34) return "Longueur IBAN invalide";
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.split("").map(c => c >= "A" ? String(c.charCodeAt(0) - 55) : c).join("");
  let remainder = 0;
  for (const chunk of numeric.match(/.{1,9}/g) ?? []) {
    remainder = Number(String(remainder) + chunk) % 97;
  }
  if (remainder !== 1) return "IBAN invalide (vérifiez les chiffres)";
  return null;
}

export function formatIban(value: string): string {
  const clean = value.replace(/\s/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") ?? clean;
}
