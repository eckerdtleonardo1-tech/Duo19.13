const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

/** Minúsculas y sin tildes, para comparar texto escrito por el usuario. */
export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS_REGEX, "").toLowerCase();
}
