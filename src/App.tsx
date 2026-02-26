import TrackList from "./components/TrackList/TrackList";
import Footer from "./components/Footer/Footer";
import Modal from "./components/Modal/Modal";
import { TrackProvider } from "./contexts/TrackContext";
import { ModalProvider } from "./contexts/ModalContext";

export default function App() {
  return (
    <TrackProvider>
      <ModalProvider>
        <div style={{ padding: "2rem" }}>
          <h2
            style={{
              whiteSpace: "pre",
              fontFamily:
                "monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            }}
          >
            🎹 eightbit synth
          </h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <TrackList />
          </div>
          <Footer />
        </div>
        <Modal />
      </ModalProvider>
    </TrackProvider>
  );
}
