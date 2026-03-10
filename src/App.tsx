import TrackList from "./components/TrackList/TrackList";
import Footer from "./components/Footer/Footer";
import Modal from "./components/Modal/Modal";
import { TrackProvider } from "./contexts/TrackContext";
import { ModalProvider } from "./contexts/ModalContext";
import Header from "./components/Header/Header";

export default function App() {
  return (
    <div>
      <TrackProvider>
        <ModalProvider>
          <div
            style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <Header />

            <TrackList />
            <Footer />
          </div>
          <Modal />
        </ModalProvider>
      </TrackProvider>
    </div>
  );
}
