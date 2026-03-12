export const INITIAL_NOTE_VALUES =
  // C major scale
  [60, 62, 64, 65, 67, 69, 71, 72];

export const NOTE_OPTIONS = [
  { name: " ", midi: 0 },
  { name: "A1", midi: 33 },
  { name: "A#1", midi: 34 },
  { name: "B1", midi: 35 },
  { name: "C1", midi: 36 },
  { name: "C#1", midi: 37 },
  { name: "D1", midi: 38 },
  { name: "D#1", midi: 39 },
  { name: "E1", midi: 40 },
  { name: "F1", midi: 41 },
  { name: "F#1", midi: 42 },
  { name: "C2", midi: 36 },
  { name: "C#2", midi: 37 },
  { name: "D2", midi: 38 },
  { name: "D#2", midi: 39 },
  { name: "E2", midi: 40 },
  { name: "F2", midi: 41 },
  { name: "F#2", midi: 42 },
  { name: "G2", midi: 43 },
  { name: "G#2", midi: 44 },
  { name: "A2", midi: 45 },
  { name: "A#2", midi: 46 },
  { name: "B2", midi: 47 },
  { name: "C3", midi: 48 },
  { name: "C#3", midi: 49 },
  { name: "D3", midi: 50 },
  { name: "D#3", midi: 51 },
  { name: "E3", midi: 52 },
  { name: "F3", midi: 53 },
  { name: "F#3", midi: 54 },
  { name: "G3", midi: 55 },
  { name: "G#3", midi: 56 },
  { name: "A3", midi: 57 },
  { name: "A#3", midi: 58 },
  { name: "B3", midi: 59 },
  { name: "C4", midi: 60 },
  { name: "C#4", midi: 61 },
  { name: "D4", midi: 62 },
  { name: "D#4", midi: 63 },
  { name: "E4", midi: 64 },
  { name: "F4", midi: 65 },
  { name: "F#4", midi: 66 },
  { name: "G4", midi: 67 },
  { name: "G#4", midi: 68 },
  { name: "A4", midi: 69 },
  { name: "A#4", midi: 70 },
  { name: "B4", midi: 71 },
  { name: "C5", midi: 72 },
];

export const ARTIST_LOCAL_STORAGE_KEY = "artist";
export const TITLE_LOCAL_STORAGE_KEY = "title";
export const TEMPO_LOCAL_STORAGE_KEY = "tempo";
export const DEFAULT_TEMPO = 120;

export type WaveformType = "sine" | "triangle" | "square" | "sawtooth";
export const WAVEFORM_OPTIONS: { value: WaveformType; label: string }[] = [
  { value: "sine", label: "Sine (soft)" },
  { value: "triangle", label: "Triangle" },
  { value: "square", label: "Square" },
  { value: "sawtooth", label: "Sawtooth (bright)" },
];
export const WAVEFORM_LOCAL_STORAGE_KEY = "waveform";
export const DEFAULT_WAVEFORM: WaveformType = "sine";

export const ATTACK_LOCAL_STORAGE_KEY = "attack";
export const DEFAULT_ATTACK = 0.05; // seconds; higher = softer onset
export const ATTACK_MIN = 0.01;
export const ATTACK_MAX = 0.5;

export const NOTE_DURATION_LOCAL_STORAGE_KEY = "noteDuration";
export const DEFAULT_NOTE_DURATION = 0.45; // seconds
export const NOTE_DURATION_MIN = 0.1;
export const NOTE_DURATION_MAX = 1.5;

export const STANDARD_TUNING_NOTES: Record<string, number> =
  NOTE_OPTIONS.reduce(
    (acc, note) => {
      acc[note.name] = note.midi;
      return acc;
    },
    {} as Record<string, number>,
  );

// Guitar: 6 strings, standard tuning. Top = high E, bottom = low E (display order).
export const GUITAR_STRING_ORDER = ["E4", "B3", "G3", "D3", "A2", "E2"] as const;
export const GUITAR_OPEN_MIDI: Record<string, number> = {
  E4: 64,
  B3: 59,
  G3: 55,
  D3: 50,
  A2: 45,
  E2: 40,
};
export const PEG_CELL_COUNT = 61; // frets 0 (open) through 60
export const PEG_LETTERS_STORAGE_KEY = "synth-project-peg-letters";
export const PEG_CELLS_STORAGE_KEY = "synth-project-peg-cells";

const SEMITONE_MAP: Record<string, number> = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, "E#": 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11, Cb: 11,
};

export function noteLetterToMidi(letter: string, octave: number): number | null {
  const semi = SEMITONE_MAP[letter] ?? SEMITONE_MAP[letter.toUpperCase()];
  if (semi === undefined) return null;
  return 12 * (octave + 1) + semi;
}

export function octaveFromStringKey(key: string): number {
  return parseInt(key.slice(-1), 10);
}
