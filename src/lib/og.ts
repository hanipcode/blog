import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

interface OgImageOptions {
  title: string;
  description: string;
  eyebrow: string;
  footer?: string;
  tags?: readonly string[];
  variant?: "home" | "post";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(
  value: string,
  maxCharacters: number,
  maxLines: number,
): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  let truncated = false;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxCharacters || !line) {
      line = candidate;
      continue;
    }

    if (lines.length === maxLines - 1) {
      truncated = true;
      break;
    }

    lines.push(line);
    line = word;
  }

  if (line && lines.length < maxLines) lines.push(line);

  if (truncated) {
    lines[lines.length - 1] =
      `${lines[lines.length - 1].replace(/[.,;:!?]?$/, "")}…`;
  }

  return lines;
}

function textLines(
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
): string {
  return lines
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${y + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
}

export async function generateOgImage({
  title,
  description,
  eyebrow,
  footer = "HANIPCODE.COM",
  tags = [],
  variant = "post",
}: OgImageOptions): Promise<Buffer> {
  const titleSize = title.length > 105 ? 56 : title.length > 72 ? 64 : 74;
  const titleLines = wrapText(title, title.length > 105 ? 34 : 29, 4);
  const descriptionLines = wrapText(description, 74, 2);
  const titleY = variant === "home" ? 192 : 184;
  const titleLineHeight = Math.round(titleSize * 1.02);
  const descriptionY = titleY + titleLines.length * titleLineHeight + 42;
  const tagText = tags.slice(0, 4).join("  /  ");

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#121612" />
      <g opacity="0.14" stroke="#ebe7dc" stroke-width="1">
        <line x1="80" y1="0" x2="80" y2="630" />
        <line x1="360" y1="0" x2="360" y2="630" />
        <line x1="640" y1="0" x2="640" y2="630" />
        <line x1="920" y1="0" x2="920" y2="630" />
        <line x1="1120" y1="0" x2="1120" y2="630" />
      </g>
      <rect x="80" y="68" width="1040" height="1" fill="#ebe7dc" opacity="0.28" />
      <rect x="80" y="560" width="1040" height="1" fill="#ebe7dc" opacity="0.28" />
      <circle cx="1030" cy="170" r="118" fill="none" stroke="#315b52" stroke-width="34" opacity="0.68" />
      <circle cx="1092" cy="112" r="12" fill="#d5a064" />

      <text x="80" y="48" fill="#ebe7dc" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">MUHAMMAD HANIF</text>
      <text x="1120" y="48" text-anchor="end" fill="#aaa99f" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2">${escapeXml(footer)}</text>
      <text x="80" y="126" fill="#d5a064" font-family="monospace" font-size="18" letter-spacing="2">${escapeXml(eyebrow.toUpperCase())}</text>

      <text fill="#ebe7dc" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" font-weight="700" letter-spacing="-2">
        ${textLines(titleLines, 80, titleY, titleLineHeight)}
      </text>

      <text fill="#aaa99f" font-family="Arial, sans-serif" font-size="25" font-weight="400">
        ${textLines(descriptionLines, 80, descriptionY, 36)}
      </text>

      <text x="80" y="603" fill="#d5a064" font-family="monospace" font-size="14" letter-spacing="1.5">${escapeXml(tagText.toUpperCase())}</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
