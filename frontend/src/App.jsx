import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error("Erro ao conectar com backend:", err);
        setMessage("Erro ao conectar com o backend");
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Frontend React ⚛️</h1>
      <p>Mensagem do backend: {message}</p>
    </div>
  );
}

export default App;
