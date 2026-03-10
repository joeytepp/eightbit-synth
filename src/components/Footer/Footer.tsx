export default function Footer() {
  return (
    <div
      style={{
        padding: "1rem 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
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
