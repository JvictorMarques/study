import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

const HealthMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const apiRoutes = [
    { method: 'GET', path: '/', description: 'Root endpoint' },
    { method: 'GET', path: '/health', description: 'Health check' },
    { method: 'GET', path: '/db-check', description: 'Database check' },
    { method: 'GET', path: '/cache-check', description: 'Cache check' }
  ];

  const checkHealth = async () => {
    setLoading(true);
    try {
  const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      if (!response.ok) {
        setHealthData({
          ...data,
          httpStatus: response.status,
          error: `Serviços com problemas (HTTP ${response.status})`
        });
      } else {
        setHealthData({
          ...data,
          httpStatus: response.status
        });
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao verificar saúde:', error);
      setHealthData({
        status: 'unhealthy',
        httpStatus: 0,
        error: 'Não foi possível conectar ao backend',
        services: {
          database: 'unknown',
          cache: 'unknown'
        },
        issues: [{
          service: 'backend',
          message: 'Falha na conexão com a API',
          error: error.message
        }]
      });
    }
    setLoading(false);
  };

  const checkRoute = async (path) => {
    try {
      const startTime = Date.now();
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url);
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        responseTime: responseTime,
        data: data,
        error: !response.ok ? data.error || `HTTP ${response.status}` : null
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        statusCode: 0,
        error: error.message,
        responseTime: null
      };
    }
  };

  const checkAllRoutes = async () => {
    setRoutesLoading(true);
    const routeChecks = await Promise.all(
      apiRoutes.map(async (route) => {
        const result = await checkRoute(route.path);
        return {
          ...route,
          ...result
        };
      })
    );
    setRoutes(routeChecks);
    setRoutesLoading(false);
  };

  const refreshAll = async () => {
    setLoading(true);
    setRoutesLoading(true);
    await Promise.all([
      checkHealth(),
      checkAllRoutes()
    ]);
  };

  useEffect(() => {
    refreshAll();
    
    const interval = setInterval(() => {
      refreshAll();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    refreshAll();
  };

  const getStatusClass = (status, isLoading = false) => {
    if (isLoading) return 'loading';
    return status === 'healthy' ? 'healthy' : 'unhealthy';
  };

  return (
    <div className="dashboard">
      {/* Overall Health Status */}
      <div className="card">
        <h3>
          <span className={`status-indicator status-${getStatusClass(healthData?.status, loading)}`}></span>
          Status Geral do Sistema
        </h3>
        
        {loading ? (
          <p>Verificando status...</p>
        ) : healthData ? (
          <>
            <div className={`service-status ${getStatusClass(healthData.status, loading)}`}>
              {healthData.status === 'healthy' ? '✅ Sistema Saudável' : '❌ Sistema com Problemas'}
            </div>
            
            {healthData.services && (
              <ul className="service-list">
                <li className="service-item">
                  <span className="service-name">📊 Base de Dados</span>
                  <span className={`service-status ${getStatusClass(healthData.services.database, loading)}`}>
                    {healthData.services.database}
                  </span>
                </li>
                <li className="service-item">
                  <span className="service-name">🗄️ Cache (Redis)</span>
                  <span className={`service-status ${getStatusClass(healthData.services.cache, loading)}`}>
                    {healthData.services.cache}
                  </span>
                </li>
              </ul>
            )}
            
            {healthData.error && (
              <div className="error-message">
                {healthData.error}
                {healthData.httpStatus && (
                  <span style={{ fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
                    Código HTTP: {healthData.httpStatus}
                  </span>
                )}
              </div>
            )}

            {healthData.issues && healthData.issues.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '10px', color: '#f44336' }}>
                  🚨 Problemas Detectados:
                </h4>
                {healthData.issues.map((issue, index) => (
                  <div key={index} className="error-message" style={{ marginBottom: '8px' }}>
                    <strong>{issue.service}:</strong> {issue.message}
                    {issue.error && (
                      <details style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                        <summary style={{ cursor: 'pointer' }}>Ver detalhes do erro</summary>
                        <code style={{ display: 'block', marginTop: '5px', padding: '5px', backgroundColor: '#f5f5f5' }}>
                          {issue.error}
                        </code>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p>Falha ao carregar dados de saúde</p>
        )}
        
        {lastUpdate && (
          <div className="timestamp">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
        
        <button onClick={handleRefresh} className="refresh-button">
          🔄 Atualizar Status {(loading || routesLoading) && '(Atualizando...)'}
        </button>
      </div>

      {/* API Routes Status */}
      <div className="card">
        <h3>
          <span className={`status-indicator status-${routesLoading ? 'loading' : 'healthy'}`}></span>
          Rotas da API {routesLoading && '(Verificando...)'}
        </h3>
        
        {routes.length > 0 ? (
          <div>
            {routes.map((route, index) => (
              <div key={index} className="route-item">
                <div>
                  <span className={`route-method ${route.method.toLowerCase()}`}>
                    {route.method}
                  </span>
                  <span className="route-path">{route.path}</span>
                  {route.responseTime && (
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
                      ({route.responseTime}ms)
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`service-status ${getStatusClass(route.status, routesLoading)}`}>
                    {route.status === 'healthy' ? '✅' : '❌'}
                    {route.statusCode && ` ${route.statusCode}`}
                  </span>
                  {route.error && (
                    <div style={{ fontSize: '0.8rem', color: '#f44336', marginTop: '2px' }}>
                      {route.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Carregando rotas...</p>
        )}
      </div>
    </div>
  );
};

export default HealthMonitor;
