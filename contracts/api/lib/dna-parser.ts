/**
 * DNA raw-file parsing for consumer genetics exports.
 *
 * IMPORTANT REALITY CHECK
 * -----------------------
 * Raw exports from 23andMe and AncestryDNA are *genotype* files: a long list of
 * SNPs (rsid, chromosome, position, allele genotype). They do NOT contain the
 * "you are 45% West African" ancestry breakdown — that breakdown is computed by
 * each company against proprietary reference panels and is only available inside
 * their own products / API, not in the downloadable raw file.
 *
 * So this parser does what is actually possible from a raw file:
 *   1. Validate the file is a genuine 23andMe / Ancestry raw export.
 *   2. Count SNPs and detect the provider + build.
 *   3. Extract a handful of well-known ancestry-informative / haplogroup-defining
 *      markers (a lightweight, transparent heuristic — NOT a clinical result).
 *
 * For a production-grade ancestry breakdown you would either:
 *   (a) integrate the provider's OAuth API to read the user's computed ancestry, or
 *   (b) run a reference-panel admixture pipeline (e.g. ADMIXTURE) server-side.
 * Both are out of scope here; the UI lets the parent confirm/supplement heritage.
 */

export type DnaProvider = "23andMe" | "AncestryDNA" | "MyHeritage" | "unknown";

export type ParsedSnp = {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
};

export type ParsedDnaFile = {
  provider: DnaProvider;
  build: string | null;
  snpCount: number;
  /** A small set of recognised markers, keyed by rsid. */
  markers: Record<string, string>;
  /** Best-effort mitochondrial / Y haplogroup hints, if derivable. */
  haplogroupHints: Record<string, string>;
  warnings: string[];
};

// A tiny, illustrative panel of widely-documented markers. This is intentionally
// conservative and is used only to show the parent we successfully read their
// file — never presented as a definitive ancestry result.
const NOTABLE_MARKERS: Record<string, string> = {
  rs1426654: "SLC24A5 — skin pigmentation (worldwide variation)",
  rs16891982: "SLC45A2 — pigmentation",
  rs4988235: "LCT — lactase persistence",
  rs1042602: "TYR — pigmentation",
  rs12913832: "HERC2/OCA2 — eye color",
};

function detectProvider(headerLines: string[]): {
  provider: DnaProvider;
  build: string | null;
} {
  const header = headerLines.join("\n").toLowerCase();
  let build: string | null = null;
  const buildMatch = header.match(/build\s*(\d{2,3})/);
  if (buildMatch) build = `GRCh build ${buildMatch[1]}`;

  if (header.includes("23andme")) return { provider: "23andMe", build };
  if (header.includes("ancestrydna") || header.includes("ancestry.com"))
    return { provider: "AncestryDNA", build };
  if (header.includes("myheritage")) return { provider: "MyHeritage", build };
  return { provider: "unknown", build };
}

/**
 * Parse a raw DNA export. Handles both the 23andMe TSV format
 * (rsid  chromosome  position  genotype) and the AncestryDNA format
 * (rsid  chromosome  position  allele1  allele2).
 */
export function parseDnaFile(text: string): ParsedDnaFile {
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/);

  const headerLines = lines.filter((l) => l.startsWith("#")).slice(0, 40);
  const { provider, build } = detectProvider(headerLines);

  if (provider === "unknown") {
    warnings.push(
      "Could not confirm the provider from the file header. Parsing as a generic genotype file.",
    );
  }

  const markers: Record<string, string> = {};
  const haplogroupHints: Record<string, string> = {};
  let snpCount = 0;

  for (const line of lines) {
    if (!line || line.startsWith("#") || line.startsWith("rsid")) continue;
    const cols = line.split(/\t|,/).map((c) => c.trim().replace(/"/g, ""));
    if (cols.length < 4) continue;

    const rsid = cols[0];
    const chromosome = cols[1];
    const position = Number(cols[2]);
    // 23andMe: single genotype column. Ancestry: two allele columns.
    const genotype =
      cols.length >= 5 ? `${cols[3]}${cols[4]}` : cols[3];

    if (!rsid || Number.isNaN(position)) continue;
    snpCount++;

    if (NOTABLE_MARKERS[rsid] && genotype && genotype !== "--") {
      markers[rsid] = `${genotype} (${NOTABLE_MARKERS[rsid]})`;
    }

    // Mitochondrial (chr MT) and Y (chr Y) presence hints
    if (chromosome === "MT" && !haplogroupHints.mtDNA) {
      haplogroupHints.mtDNA = "Mitochondrial markers present (maternal line)";
    }
    if ((chromosome === "Y") && !haplogroupHints.yDNA) {
      haplogroupHints.yDNA = "Y-chromosome markers present (paternal line)";
    }
  }

  if (snpCount === 0) {
    warnings.push(
      "No SNP rows were found. This may not be a valid raw DNA export.",
    );
  } else if (snpCount < 100000) {
    warnings.push(
      `Only ${snpCount.toLocaleString()} markers found — a full export usually has 500k+. The file may be partial.`,
    );
  }

  return {
    provider,
    build,
    snpCount,
    markers,
    haplogroupHints,
    warnings,
  };
}
