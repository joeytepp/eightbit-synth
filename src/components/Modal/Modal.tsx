import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../../contexts/ModalContext";

export default function Modal() {
  const { isOpen, content, closeModal } = useModal();

  useEffect(() => {
    if (!isOpen) return;

    const keydownHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", keydownHandler);

    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 2147483647,
        padding: "1rem",
        boxSizing: "border-box",
      }}
      onClick={closeModal}
    >
      {/* Center the dialog with absolute + transform (reliable across browsers) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "calc(100% - 2rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            minWidth: "280px",
            maxWidth: "90vw",
            maxHeight: "min(90vh, calc(100vh - 2rem))",
            overflow: "auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
