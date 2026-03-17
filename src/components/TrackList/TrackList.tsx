import React from "react";
import TabString from "../TabString/TabString";
import { GUITAR_STRING_ORDER } from "../../constants";
import { useTabContext } from "../../contexts/TabContext";
import useCopyTab from "../../utils/copyTab";

export default function TrackList() {
  const { playAllNotes, stopPlayback, isPlaying } = useTabContext();

  const { copyTab, isCopied } = useCopyTab();

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <button type="button" onClick={playAllNotes}>
          ▶️ Play
        </button>
        {isPlaying && (
          <button type="button" onClick={stopPlayback}>
            ⏹️ Stop
          </button>
        )}
        <button type="button" onClick={copyTab}>
          {isCopied ? "☑️ Copied!" : "📋 Copy Tab"}
        </button>
      </div>
      <div id="tab-strings">
        {GUITAR_STRING_ORDER.map((note) => (
          <TabString key={note} note={note} />
        ))}
      </div>
    </div>
  );
}
