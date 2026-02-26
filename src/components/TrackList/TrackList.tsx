import React from "react";
import { useTrackContext } from "../../contexts/TrackContext";
import Track from "../Track/Track";
import EmptyTrack from "../EmptyTrack/EmptyTrack";

export default function TrackList() {
  const { tracks } = useTrackContext();

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {tracks.map((t, index) => (
        <Track key={t.id} trackId={t.id} index={index} />
      ))}
      <EmptyTrack />
    </div>
  );
}
