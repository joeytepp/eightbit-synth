import React from "react";
import { useTrackContext } from "../../contexts/TrackContext";

export default function EmptyTrack() {
  const { addTrack } = useTrackContext();

  return (
    <div
      style={{
        flex: 1,
        border: "1px dashed #000",
        display: "block",
        height: "100%",
        minHeight: 0,
        alignItems: "stretch",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <button onClick={addTrack}>Add Track</button>
    </div>
  );
}
