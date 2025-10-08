import { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import HealthMonitor from "./HealthMonitor";
import ApiDocumentation from "./ApiDocumentation";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch(API_BASE_URL)
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao conectar com backend:", err);
        setMessage("❌ Erro ao conectar com o backend");
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🚀 Dashboard de Monitoramento</h1>
          <p>
            {loading ? "Conectando..." : message}
          </p>
        </header>

        <HealthMonitor />

        <div className="dashboard">
          <div className="card">
            <h3>
              <span className="status-indicator status-healthy"></span>
              Informações do Sistema
            </h3>
            <ul className="service-list">
              <li className="service-item">
                <span className="service-name">⚛️ Frontend</span>
                <span className="service-status healthy">React + Vite</span>
              </li>
              <li className="service-item">
                <span className="service-name">🐍 Backend</span>
                <span className="service-status healthy">FastAPI</span>
              </li>
              <li className="service-item">
                <span className="service-name">🐳 Deploy</span>
                <span className="service-status healthy">Docker Compose</span>
              </li>
            </ul>
          </div>

          <ApiDocumentation />
        </div>
      </div>
    </div>
  );
}

export default App;
