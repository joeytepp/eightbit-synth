import { useTrackContext } from "../../contexts/TrackContext";

export default function Footer() {
  const { playSequence } = useTrackContext();

  return (
    <div
      style={{
        padding: "1rem 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <button onClick={() => playSequence()}>Play Sequence</button>
      <button>Share</button>
    </div>
  );
}
