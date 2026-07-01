/**
 * components/chat/ChatInterface.jsx
 * ============================================================
 * Interfaz de chat principal. Envía mensajes reales al motor
 * semántico de Athena Core a través de useSystemConnection y
 * muestra las respuestas reales que devuelve el sistema.
 * No hay respuestas simuladas: si Athena Core no responde,
 * se muestra un error real en el chat.
 * ============================================================
 */

import { useState, useRef, useEffect } from "react";
import { Send, WifiOff, Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useSystemConnection } from "../../hooks/useSystemConnection";

/**
 * Genera un id local único para cada mensaje en la conversación.
 * (Solo identifica el mensaje en la UI, no proviene del sistema).
 */
function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatInterface({ activeProject }) {
  const { isConnected, isLoading, sendMessage } = useSystemConnection();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll al último mensaje cada vez que la conversación cambia.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Ajusta la altura del textarea automáticamente (multilínea).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: createLocalId(),
      role: "user",
      type: "text",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    try {
      // Llamada real al motor semántico de Athena Core.
      const response = await sendMessage(text, {
        projectId: activeProject?.id ?? null,
        history: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
      });

      const athenaMessage = {
        id: createLocalId(),
        role: "athena",
        type: response.type,
        content: response.content,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, athenaMessage]);
    } catch (err) {
      // Error real de la conexión/sistema: se muestra tal cual, sin inventar contenido.
      const errorMessage = {
        id: createLocalId(),
        role: "athena",
        type: "error",
        content: err?.message || "Athena Core no pudo procesar el mensaje.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e) => {
    // Enter envía, Shift+Enter agrega una línea nueva.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="ac-chat">
      <header className="ac-chat__header">
        <div>
          <h2>{activeProject ? activeProject.name : "Conversación"}</h2>
          <p className="ac-chat__subtitle">
            {isConnected ? "Athena Core · en línea" : "Sin conexión con Athena Core"}
          </p>
        </div>
      </header>

      <div className="ac-chat__messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="ac-chat__empty">
            <Sparkles size={22} />
            <p>Escribe un mensaje para empezar a conversar con Athena Core.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="ac-message ac-message--athena" aria-live="polite">
            <div className="ac-message__avatar" aria-hidden="true">
              <Sparkles size={16} />
            </div>
            <div className="ac-bubble ac-bubble--athena ac-typing">
              <span className="ac-typing__dot" />
              <span className="ac-typing__dot" />
              <span className="ac-typing__dot" />
            </div>
          </div>
        )}
      </div>

      <div className="ac-chat__input-bar">
        {!isConnected && (
          <div className="ac-chat__warning">
            <WifiOff size={14} />
            <span>No hay conexión activa con tu sistema. Revisa la configuración.</span>
          </div>
        )}

        <div className="ac-chat__input-row">
          <textarea
            ref={textareaRef}
            className="ac-chat__textarea"
            placeholder="Escribe un mensaje para Athena Core… (Shift+Enter para salto de línea)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="button"
            className="ac-chat__send"
            onClick={handleSend}
            disabled={!draft.trim() || isLoading}
            aria-label="Enviar mensaje"
          >
            <Send size={18} className={isLoading ? "ac-send-icon--sending" : ""} />
          </button>
        </div>
      </div>
    </section>
  );
}
