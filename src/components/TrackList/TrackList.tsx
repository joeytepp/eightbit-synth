import React, { useEffect } from "react";
import TabString from "../TabString/TabString";
import { GUITAR_STRING_ORDER } from "../../constants";
import { useTabContext } from "../../contexts/TabContext";
import useCopyTab from "../../utils/copyTab";
import useUrlParams from "../../hooks/use-url-params";

export default function TrackList() {
  const { playAllNotes, stopPlayback, isPlaying } = useTabContext();

  const { loadUrlParams, overrideNoteOrder } = useUrlParams();
  const { isCopied, copyTab } = useCopyTab();

  useEffect(() => {
    loadUrlParams();
  }, [loadUrlParams]);

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
        {GUITAR_STRING_ORDER.map((note, i) => (
          <TabString
            key={note}
            note={note}
            overrideNote={overrideNoteOrder[i]}
          />
        ))}
      </div>
    </div>
  );
}
