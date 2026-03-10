// import { useTrackContext } from "../../contexts/TrackContext";

export default function Footer() {
  // const { playSequence } = useTrackContext();

  return (
    <div
      style={{
        padding: "1rem 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* <button onClick={() => playSequence()}>Play Sequence</button> */}
      <div
        style={{
          paddingTop: "1rem",
          margin: "0 auto",
        }}
      >
        © Copyright <a href="https://joeytepperman.com">Joey Tepperman</a>{" "}
        {new Date().getFullYear()}
      </div>
    </div>
  );
}
