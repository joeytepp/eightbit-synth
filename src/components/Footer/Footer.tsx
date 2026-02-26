import { useTrackContext } from "../../contexts/TrackContext";
import { useModal } from "../../contexts/ModalContext";
import ShareModal from "../ShareModal/ShareModal";

export default function Footer() {
  const { playSequence } = useTrackContext();
  const { openModal } = useModal();

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
      <button onClick={() => openModal(<ShareModal />)}>Share</button>
    </div>
  );
}
