import React from "react";
import { useTrack, useTrackContext } from "../../contexts/TrackContext";
import { NOTE_OPTIONS } from "../../constants";

interface TrackProps {
  trackId: string;
  index: number;
}

export default function Track({ trackId, index }: TrackProps) {
  const { notes, addNote, removeNote, changeNote } = useTrack(trackId);
  const { tracks, removeTrack } = useTrackContext();
  const canRemoveTrack = tracks.length > 1;

  return (
    <div
      style={{
        flex: 1,
        display: "block",
        border: "1px dashed #000",
        padding: "1rem",
      }}
    >
      <div
        style={{
          marginBottom: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p>Track #{index + 1}</p>
        {canRemoveTrack && (
          <button
            onClick={() =>
              window.confirm("Are you sure you want to remove this track?") &&
              removeTrack(trackId)
            }
          >
            X
          </button>
        )}
      </div>
      {notes.map((note, index) => (
        <div key={index} style={{ marginBottom: "0.5rem" }}>
          <select
            value={note}
            onChange={(e) => changeNote(index, Number(e.target.value))}
          >
            {NOTE_OPTIONS.map((option) => (
              <option key={option.midi} value={option.midi}>
                {option.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => removeNote(index)}
            style={{ marginLeft: "0.5rem" }}
          >
            Remove
          </button>
        </div>
      ))}

      <button onClick={addNote}>Add Note</button>
    </div>
  );
}
