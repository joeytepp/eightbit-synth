export type Bar = {
  id: string;
  notes: number[];
  time: number;
  duration: number;
};

export type Track = {
  id: string;
  bars: Bar[];
};
