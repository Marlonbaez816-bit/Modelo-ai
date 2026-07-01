/**
 * App.jsx
 * ============================================================
 * Layout raíz de Athena Core: barra lateral (proyectos +
 * configuración de conexión) y panel de chat. Mantiene el
 * estado global de la app (proyectos, tema, panel de ajustes)
 * mediante Context API.
 * ============================================================
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Plus,
  Settings,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Loader2,
  MessageSquare,
  X,
} from "lucide-react";
import ChatInterface from "./components/chat/ChatInterface";
import { useSystemConnection } from "./hooks/useSystemConnection";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Athena Core";
const PROJECTS_STORAGE_KEY = "athena_projects";
const THEME_STORAGE_KEY = "athena_theme";

// Contexto global de la aplicación: proyectos activos y utilidades compartidas.
const AppContext = createContext(null);
export function useAppContext() {
  return useContext(AppContext);
}

/**
 * Panel lateral de configuración de conexión con Athena Core.
 * Permite ver el estado real y cambiar la URL del sistema.
 */
function ConnectionPanel({ onClose }) {
  const { isConnected, isConnecting, error, systemUrl, setSystemUrl, connect } =
    useSystemConnection();
  const [inputUrl, setInputUrl] = useState(systemUrl);

  useEffect(() => setInputUrl(systemUrl), [systemUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    await setSystemUrl(inputUrl);
  };

  return (
    <div className="ac-panel-overlay" role="dialog" aria-modal="true">
      <div className="ac-panel">
        <div className="ac-panel__header">
          <h3>Conexión con Athena Core</h3>
          <button type="button" className="ac-icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={`ac-status-row ${isConnected ? "ac-status-row--ok" : "ac-status-row--off"}`}>
          {isConnecting ? (
            <Loader2 size={16} className="ac-spin" />
          ) : isConnected ? (
            <Wifi size={16} />
          ) : (
            <WifiOff size={16} />
          )}
          <span>
            {isConnecting
              ? "Probando conexión…"
              : isConnected
              ? "Conectado al sistema real"
              : "Sin conexión"}
          </span>
        </div>

        <form onSubmit={handleSave} className="ac-panel__form">
          <label htmlFor="system-url">URL de tu sistema</label>
          <input
            id="system-url"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:3000"
          />
          <div className="ac-panel__actions">
            <button type="submit" className="ac-button ac-button--primary">
              Guardar y probar
            </button>
            <button type="button" className="ac-button" onClick={connect}>
              Probar de nuevo
            </button>
          </div>
        </form>

        {error && <p className="ac-panel__error">{error}</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem(THEME_STORAGE_KEY) || "dark"
  );
  const [projects, setProjects] = useState(() => {
    try {
      const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { isConnected, isConnecting } = useSystemConnection();

  // Aplica el tema como atributo en <html> para que index.css lo lea.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Persiste los proyectos reales creados por el usuario (nada de datos de ejemplo).
  useEffect(() => {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const addProject = useCallback(() => {
    const name = window.prompt("Nombre del nuevo proyecto:");
    if (!name || !name.trim()) return;
    const project = { id: `${Date.now()}`, name: name.trim(), createdAt: new Date().toISOString() };
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const contextValue = { projects, activeProject, setActiveProjectId, addProject };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="ac-app">
        {/* Barra lateral: identidad, proyectos y configuración */}
        <aside className="ac-sidebar">
          <div className="ac-sidebar__brand">
            <span className="ac-brand__glyph" aria-hidden="true" />
            <span className="ac-brand__name">{APP_NAME}</span>
          </div>

          <button type="button" className="ac-button ac-button--primary ac-button--block" onClick={addProject}>
            <Plus size={16} />
            Nuevo proyecto
          </button>

          <nav className="ac-sidebar__projects">
            {projects.length === 0 ? (
              <p className="ac-sidebar__empty">Todavía no hay proyectos. Crea el primero.</p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`ac-project ${project.id === activeProjectId ? "ac-project--active" : ""}`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <MessageSquare size={15} />
                  <span>{project.name}</span>
                </button>
              ))
            )}
          </nav>

          <div className="ac-sidebar__footer">
            <button
              type="button"
              className={`ac-connection-pill ${isConnected ? "is-online" : "is-offline"}`}
              onClick={() => setShowSettings(true)}
            >
              {isConnecting ? (
                <Loader2 size={13} className="ac-spin" />
              ) : (
                <span className="ac-connection-dot" />
              )}
              {isConnected ? "Conectado" : "Desconectado"}
            </button>

            <div className="ac-sidebar__footer-actions">
              <button
                type="button"
                className="ac-icon-button"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                type="button"
                className="ac-icon-button"
                onClick={() => setShowSettings(true)}
                aria-label="Configuración de conexión"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Panel principal de chat */}
        <main className="ac-main">
          <ChatInterface activeProject={activeProject} />
        </main>

        {showSettings && <ConnectionPanel onClose={() => setShowSettings(false)} />}
      </div>
    </AppContext.Provider>
  );
}
