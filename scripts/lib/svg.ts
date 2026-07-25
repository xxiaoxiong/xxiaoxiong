export type Theme = "dark" | "light";

export const palette = {
  dark: {
    background: "#080B12",
    surface: "#0C111B",
    surfaceAlt: "#111827",
    cyan: "#3DE1FF",
    violet: "#8B5CF6",
    green: "#80FFB2",
    text: "#E7EDF7",
    muted: "#8491A5",
    grid: "#182235"
  },
  light: {
    background: "#F6F8FC",
    surface: "#FFFFFF",
    surfaceAlt: "#EEF2F8",
    cyan: "#007C99",
    violet: "#6D3BE8",
    green: "#16834B",
    text: "#101828",
    muted: "#526071",
    grid: "#D7DFEB"
  }
} as const;

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function documentStart(
  width: number,
  height: number,
  title: string,
  description: string
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>`;
}

export function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
