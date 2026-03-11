import TrackList from "./components/TrackList/TrackList";
import Footer from "./components/Footer/Footer";
import Modal from "./components/Modal/Modal";
import ChallengeLoader from "./components/ChallengeLoader/ChallengeLoader";
import { TrackProvider } from "./contexts/TrackContext";
import { PegProvider } from "./contexts/PegContext";
import { ModalProvider } from "./contexts/ModalContext";
import { ChallengeProvider } from "./contexts/ChallengeContext";
import Header from "./components/Header/Header";

export default function App() {
  return (
    <div>
      <TrackProvider>
        <PegProvider>
          <ChallengeProvider>
            <ModalProvider>
              <ChallengeLoader />
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
          </ChallengeProvider>
        </PegProvider>
      </TrackProvider>
    </div>
  );
}
