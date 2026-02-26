import React, { useEffect, useState } from "react";
import { decodeSharePayload, SharePayload } from "../../utils/shareUrl";
import ShareModal from "../ShareModal/ShareModal";
import { useModal } from "../../contexts/ModalContext";

export default function Header() {
  const [decodedPayload, setDecodedPayload] = useState<SharePayload | null>(
    null,
  );

  const { openModal } = useModal();

  useEffect(() => {
    const url = window.location.href;

    console.log(url);

    if (!url.includes("/")) return;

    const payload = decodeSharePayload(url.split("/").pop() || "");

    if (payload) {
      setDecodedPayload(payload);
    }

    window.history.replaceState({}, "", "/");
  }, [decodedPayload]);

  console.log(window.location.href);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: "1rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", flex: 1 }}>
            🎹 eightbit synth
          </h2>
        </div>
        <div style={{ display: "flex" }}>
          <pre>{JSON.stringify(decodedPayload, null, 2)}</pre>
        </div>
      </div>
      <div>
        <button onClick={() => openModal(<ShareModal />)}>Share</button>
      </div>
    </div>
  );
}
