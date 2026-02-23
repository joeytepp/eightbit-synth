import React from "react";
import Bar from "../Bar/Bar";

export type TrackProps = {
  bars: number[][];
};

export default function Track({ bars }: TrackProps) {
  return (
    <div>
      {bars.map((bar, index) => (
        <div key={index}>
          <Bar notes={[bar]} />
        </div>
      ))}
    </div>
  );
}
