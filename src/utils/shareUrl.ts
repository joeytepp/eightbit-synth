import Sqids from "sqids";
import { TrackContextValue } from "../contexts/TrackContext";

export interface Track {
  id: string;
  notes: number[][];
}

export interface SharePayload {
  title: string;
  artist: string;
  tracks: TrackContextValue["tracks"];
}

const sqids = new Sqids();

/**
 * Encode a share payload to a sqids string (JSON → UTF-8 → 32-bit numbers → sqids).
 */
export function encodeSharePayload(payload: SharePayload): string {
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
