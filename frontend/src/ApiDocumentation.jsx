import { useState } from 'react';
import { API_BASE_URL } from './config';

const ApiDocumentation = () => {
  const [showDocs, setShowDocs] = useState(false);

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/',
      description: 'Endpoint raiz que retorna uma mensagem de boas-vindas',
      response: '{"message": "Hello from FastAPI 🚀"}'
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Verifica a saúde do sistema e serviços conectados',
      response: '{"status": "healthy", "timestamp": "...", "services": {...}}'
    },
    {
      method: 'GET',
      path: '/db-check',
      description: 'Verifica especificamente a conexão com o banco de dados',
      response: '{"status": "✅ DB conectado"}'
    },
    {
      method: 'GET',
      path: '/cache-check',
      description: 'Verifica especificamente a conexão com o Redis',
      response: '{"status": "✅ Redis conectado", "value": "ok"}'
    }
  ];

  return (
    <div className="card">
      <h3>
        <span className="status-indicator status-healthy"></span>
        📚 Documentação da API
      </h3>
      
      <button 
        onClick={() => setShowDocs(!showDocs)} 
        className="refresh-button"
        style={{ marginBottom: '20px' }}
      >
        {showDocs ? '📖 Ocultar Documentação' : '📖 Mostrar Documentação'}
      </button>

      {showDocs && (
        <div>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            Endpoints disponíveis na API:
          </p>
          
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`route-method ${endpoint.method.toLowerCase()}`}>
                  {endpoint.method}
                </span>
                <code style={{ 
                  backgroundColor: '#e9ecef', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  {endpoint.path}
                </code>
              </div>
              
              <p style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                {endpoint.description}
              </p>
              
              <details style={{ fontSize: '0.85rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#495057' }}>
                  Exemplo de resposta
                </summary>
                <pre style={{ 
                  backgroundColor: '#f1f3f4', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '8px',
                  overflow: 'auto',
                  fontSize: '0.8rem'
                }}>
                  {endpoint.response}
                </pre>
              </details>
            </div>
          ))}

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px',
            border: '1px solid #bbdefb'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#1976d2' }}>
              🔗 Links Úteis
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a 
                  href={API_BASE_URL + "/docs"}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1976d2', 
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  📊 Swagger UI - Documentação Interativa
                </a>
              </li>
              <li>
                <a 
                  href={API_BASE_URL + "/redoc"}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1976d2', 
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  📖 ReDoc - Documentação Alternativa
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDocumentation;
