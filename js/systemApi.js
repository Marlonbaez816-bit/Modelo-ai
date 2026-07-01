/**
 * services/systemApi.js
 * ============================================================
 * Capa de comunicación REAL con el motor semántico de Athena Core.
 *
 * Este archivo NO simula respuestas ni contiene datos inventados.
 * Todas las funciones hacen peticiones HTTP reales contra tu propio
 * backend (el "motor semántico"), definido por VITE_SYSTEM_API_URL.
 *
 * Contrato esperado de TU backend (ajusta las rutas si el tuyo usa
 * otras, son el único punto que tendrías que tocar):
 *
 *   GET  {BASE_URL}/api/health
 *        -> 200 OK si el sistema está vivo y listo para recibir mensajes.
 *
 *   POST {BASE_URL}/api/chat
 *        body: { message: string, context: object }
 *        -> 200 OK con JSON:
 *           {
 *             type: "text" | "code" | "image" | "web",
 *             content: string,
 *             timestamp: string (ISO 8601)
 *           }
 * ============================================================
 */

// Clave usada para persistir la URL del sistema en localStorage.
const STORAGE_KEY = "athena_system_url";

// Timeout configurable por variable de entorno (por defecto 30s).
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_SYSTEM_TIMEOUT_MS) || 30000;

/**
 * Error real y tipado para que la UI pueda distinguir qué falló
 * (esto NO es un error simulado, es la forma de propagar fallos
 * reales de red/servidor de manera manejable).
 */
export class SystemApiError extends Error {
  constructor(message, type = "unknown", status = null) {
    super(message);
    this.name = "SystemApiError";
    // type: "network" | "timeout" | "http" | "parse" | "config"
    this.type = type;
    this.status = status;
  }
}

/**
 * Devuelve la URL base activa del sistema.
 * Prioridad: URL guardada por el usuario en localStorage
 * (configurada desde la UI) > variable de entorno VITE_SYSTEM_API_URL.
 */
export function getSystemUrl() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored.trim();

  const envUrl = import.meta.env.VITE_SYSTEM_API_URL;
  if (!envUrl) {
    throw new SystemApiError(
      "No hay URL configurada para Athena Core. Define VITE_SYSTEM_API_URL en tu .env o configúrala desde el panel de conexión.",
      "config"
    );
  }
  return envUrl.trim();
}

/**
 * Guarda la URL del sistema en localStorage para que persista
 * entre sesiones. Se usa desde el hook useSystemConnection.
 */
export function setStoredSystemUrl(url) {
  const clean = (url || "").trim().replace(/\/+$/, ""); // sin barra final
  if (!clean) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, clean);
}

/**
 * Ejecuta un fetch con timeout real usando AbortController.
 * Si el sistema no responde a tiempo, se lanza un SystemApiError
 * de tipo "timeout" (no es un error inventado: es el navegador
 * abortando la petición real).
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new SystemApiError(
        `El sistema Athena Core no respondió en ${timeoutMs / 1000}s.`,
        "timeout"
      );
    }
    // Error de red real: servidor caído, CORS, DNS, conexión rechazada, etc.
    throw new SystemApiError(
      "No se pudo contactar con Athena Core. Verifica que el sistema esté encendido y accesible.",
      "network"
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Verifica que el sistema real está vivo y responde.
 * Lanza SystemApiError si no hay conexión.
 * @returns {Promise<{connected: boolean, url: string}>}
 */
export async function testConnection() {
  const baseUrl = getSystemUrl();

  const response = await fetchWithTimeout(`${baseUrl}/api/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new SystemApiError(
      `Athena Core respondió con error ${response.status} al verificar la conexión.`,
      "http",
      response.status
    );
  }

  return { connected: true, url: baseUrl };
}

/**
 * Envía un mensaje real al motor semántico de Athena Core y
 * devuelve su respuesta real. No hay generación local de texto:
 * si el sistema no responde, esta función falla.
 *
 * @param {string} message - Texto escrito por el usuario.
 * @param {object} context - Contexto adicional (proyecto activo, historial, etc).
 * @returns {Promise<{type: string, content: string, timestamp: string}>}
 */
export async function sendMessage(message, context = {}) {
  if (!message || !message.trim()) {
    throw new SystemApiError("El mensaje está vacío.", "config");
  }

  const baseUrl = getSystemUrl();

  const response = await fetchWithTimeout(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.message || errBody?.error || "";
    } catch {
      // el cuerpo del error no era JSON, se ignora y se usa el status
    }
    throw new SystemApiError(
      detail || `Athena Core devolvió un error ${response.status}.`,
      "http",
      response.status
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new SystemApiError(
      "La respuesta de Athena Core no tiene un formato JSON válido.",
      "parse"
    );
  }

  // Validación mínima del contrato de respuesta real del sistema.
  if (!data || typeof data.content !== "string") {
    throw new SystemApiError(
      "La respuesta de Athena Core no incluye contenido válido.",
      "parse"
    );
  }

  return {
    type: data.type || "text",
    content: data.content,
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

export default { getSystemUrl, setStoredSystemUrl, testConnection, sendMessage, SystemApiError };
