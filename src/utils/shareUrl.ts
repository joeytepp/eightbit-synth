import Sqids from "sqids";
import { TrackContextValue } from "../contexts/TrackContext";
import { GUITAR_STRING_ORDER, PEG_CELL_COUNT } from "../constants";

export interface Track {
  id: string;
  notes: number[][];
}

export interface SharePayload {
  title: string;
  artist: string;
  tracks: TrackContextValue["tracks"];
}

/** Payload for challenge URLs: peg tab data + optional title/artist/tempo for display and playback. */
export interface ChallengePayload {
  lettersByPeg: Record<string, string>;
  pegCells: Record<string, string[]>;
  title?: string;
  artist?: string;
  tempo?: number;
}

const sqids = new Sqids();
const challengeSqids = new Sqids(); // separate instance to avoid alphabet collision with share payloads

/**
 * Encode a share payload to a sqids string (JSON → UTF-8 → 32-bit numbers → sqids).
 */
export function (payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const byteLength = bytes.length;
  const paddedLength = Math.ceil((byteLength + 4) / 4) * 4; // +4 for length prefix, align to 4
  const buffer = new ArrayBuffer(paddedLength);
  const view = new DataView(buffer);

  view.setUint32(0, byteLength, true);

  new Uint8Array(buffer).set(bytes, 4);

  const numbers = Array.from(new Uint32Array(buffer));

  return sqids.encode(numbers);
}

/**
 * Decode a sqids string to a share payload, or null if invalid.
 */
export function decodeSharePayload(sqid: string): SharePayload | null {
  try {
    const numbers = sqids.decode(sqid);

    if (numbers.length < 2) return null; // need at least length + one chunk

    const byteLength = numbers[0];
    const buffer = new ArrayBuffer((numbers.length - 1) * 4);
    const view = new DataView(buffer);

    for (let i = 1; i < numbers.length; i++) {
      view.setUint32((i - 1) * 4, numbers[i], true);
    }

    const bytes = new Uint8Array(buffer).slice(0, byteLength);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;

    if (
      parsed == null ||
      typeof parsed !== "object" ||
      typeof (parsed as SharePayload).title !== "string" ||
      typeof (parsed as SharePayload).artist !== "string" ||
      !Array.isArray((parsed as SharePayload).tracks) ||
      !(parsed as SharePayload).tracks.every(
        (row: unknown) =>
          Array.isArray(row) &&
          row.every((n) => typeof n === "number" && n >= 0),
      )
    ) {
      return null;
    }
    return parsed as SharePayload;
  } catch {
    return null;
  }
}

const FRET_MIN = 0;
const FRET_MAX = 60;

function isValidChallengePayload(parsed: unknown): parsed is ChallengePayload {
  if (parsed == null || typeof parsed !== "object") return false;
  const p = parsed as Record<string, unknown>;
  const letters = p.lettersByPeg;
  const cells = p.pegCells;
  if (letters == null || typeof letters !== "object") return false;
  if (cells == null || typeof cells !== "object") return false;
  for (const note of GUITAR_STRING_ORDER) {
    const l = (letters as Record<string, unknown>)[note];
    if (typeof l !== "string" || l.length > 1) return false;
    const row = (cells as Record<string, unknown>)[note];
    if (!Array.isArray(row) || row.length !== PEG_CELL_COUNT) return false;
    const validCell = (c: unknown) =>
      c === "-" ||
      (typeof c === "string" &&
        !Number.isNaN(parseInt(c, 10)) &&
        parseInt(c, 10) >= FRET_MIN &&
        parseInt(c, 10) <= FRET_MAX);
    if (!row.every(validCell)) return false;
  }
  if (p.title !== undefined && typeof p.title !== "string") return false;
  if (p.artist !== undefined && typeof p.artist !== "string") return false;
  if (
    p.tempo !== undefined &&
    (typeof p.tempo !== "number" ||
      !Number.isFinite(p.tempo) ||
      p.tempo < 1 ||
      p.tempo > 300)
  )
    return false;
  return true;
}

/**
 * Encode a challenge payload to a sqids string for use in ?data= query param.
 */
export function encodeChallengePayload(payload: ChallengePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const byteLength = bytes.length;
  const paddedLength = Math.ceil((byteLength + 4) / 4) * 4;
  const buffer = new ArrayBuffer(paddedLength);
  const view = new DataView(buffer);
  view.setUint32(0, byteLength, true);
  new Uint8Array(buffer).set(bytes, 4);
  const numbers = Array.from(new Uint32Array(buffer));
  return challengeSqids.encode(numbers);
}

/**
 * Decode a challenge payload from a sqids string, or null if invalid.
 */
export function decodeChallengePayload(data: string): ChallengePayload | null {
  try {
    const numbers = challengeSqids.decode(data);
    if (numbers.length < 2) return null;
    const byteLength = numbers[0];
    const buffer = new ArrayBuffer((numbers.length - 1) * 4);
    const view = new DataView(buffer);
    for (let i = 1; i < numbers.length; i++) {
      view.setUint32((i - 1) * 4, numbers[i], true);
    }
    const bytes = new Uint8Array(buffer).slice(0, byteLength);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    return isValidChallengePayload(parsed)
      ? (parsed as ChallengePayload)
      : null;
  } catch {
    return null;
  }
}

/**
 * Build the full challenge URL with query params: mode=challenge&data=<encoded>.
 */
export function buildChallengeUrl(dataEncoded: string): string {
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname || "/"}`
      : "";
  const params = new URLSearchParams({ mode: "challenge", data: dataEncoded });
  return `${base}?${params.toString()}`;
}

/**
 * Case-insensitive Hamming distance between two strings.
 * Pads the shorter string with spaces so both have equal length.
 */
export function hammingDistance(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const len = Math.max(al.length, bl.length);
  let dist = 0;
  for (let i = 0; i < len; i++) {
    if ((al[i] ?? " ") !== (bl[i] ?? " ")) dist++;
  }
  return dist;
}

/**
 * Parse challenge params from current URL search string. Returns { data } if mode=challenge, else null.
 */
export function getChallengeParamsFromSearch(
  search: string,
): { data: string } | null {
  const params = new URLSearchParams(search);
  if (params.get("mode") !== "challenge") return null;
  const data = params.get("data");
  if (!data) return null;
  return { data };
}
