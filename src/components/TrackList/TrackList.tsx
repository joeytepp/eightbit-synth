import React from "react";
import { useTrackContext } from "../../contexts/TrackContext";
import Track from "../Track/Track";
import EmptyTrack from "../EmptyTrack/EmptyTrack";

export default function TrackList() {
  const { tracks } = useTrackContext();

  return (
    <>
      {tracks.map((t, index) => (
        <Track key={t.id} trackId={t.id} index={index} />
      ))}
      <EmptyTrack />
    </>
  );
}
