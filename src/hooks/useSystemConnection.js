/**
 * hooks/useSystemConnection.js
 * ============================================================
 * Hook que administra el estado de la conexión REAL con el
 * motor semántico de Athena Core: si está conectado, si hay
 * un error real, y el envío/recepción de mensajes reales.
 * ============================================================
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  testConnection,
  sendMessage as apiSendMessage,
  getSystemUrl,
  setStoredSystemUrl,
  SystemApiError,
} from "../services/systemApi";

export function useSystemConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // true mientras se espera respuesta a un mensaje
  const [error, setError] = useState(null);
  const [systemUrl, setSystemUrlState] = useState("");

  // Evita actualizar estado si el componente se desmontó durante un fetch.
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Al montar, recupera la URL guardada (o la de .env) para mostrarla en la UI.
  useEffect(() => {
    try {
      setSystemUrlState(getSystemUrl());
    } catch (err) {
      // No hay URL configurada todavía; el usuario deberá definirla.
      setSystemUrlState("");
      setError(err instanceof SystemApiError ? err.message : "Sin URL configurada.");
    }
  }, []);

  /**
   * Prueba la conexión real contra Athena Core.
   * Actualiza isConnected según la respuesta real del sistema.
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await testConnection();
      if (!isMounted.current) return false;
      setIsConnected(true);
      setSystemUrlState(result.url);
      return true;
    } catch (err) {
      if (!isMounted.current) return false;
      setIsConnected(false);
      setError(err instanceof SystemApiError ? err.message : "Error de conexión desconocido.");
      return false;
    } finally {
      if (isMounted.current) setIsConnecting(false);
    }
  }, []);

  /**
   * Cambia la URL del sistema, la persiste en localStorage y
   * vuelve a probar la conexión contra la nueva URL real.
   */
  const setSystemUrl = useCallback(
    async (url) => {
      setStoredSystemUrl(url);
      setSystemUrlState(url.trim().replace(/\/+$/, ""));
      setIsConnected(false);
      setError(null);
      return connect();
    },
    [connect]
  );

  /**
   * Envía un mensaje real a Athena Core y devuelve su respuesta real.
   * Lanza el error tal cual para que el componente que llama decida
   * cómo mostrarlo (por ejemplo, como burbuja de error en el chat).
   */
  const sendMessage = useCallback(async (message, context = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiSendMessage(message, context);
      return response;
    } catch (err) {
      const msg = err instanceof SystemApiError ? err.message : "Error al enviar el mensaje.";
      setError(msg);
      // Si el error es de red, reflejamos que la conexión se perdió.
      if (err instanceof SystemApiError && (err.type === "network" || err.type === "timeout")) {
        setIsConnected(false);
      }
      throw err;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  // Intenta conectar automáticamente al montar la aplicación.
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isConnected,
    isConnecting,
    isLoading,
    error,
    systemUrl,
    connect,
    setSystemUrl,
    sendMessage,
  };
}

export default useSystemConnection;
