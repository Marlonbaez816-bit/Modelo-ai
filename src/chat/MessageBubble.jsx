/**
 * components/chat/MessageBubble.jsx
 * ============================================================
 * Representa un único mensaje dentro de la conversación.
 * Soporta varios tipos de contenido devueltos por el sistema
 * real: "text", "code", "image" y "web".
 * ============================================================
 */

import { Sparkles, User, AlertTriangle, Copy, Check } from "lucide-react";
import { useState } from "react";

/**
 * Formatea un timestamp ISO a hora local corta (HH:MM).
 */
function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Bloque de código con botón de copiar. Se usa cuando
 * message.type === "code".
 */
function CodeBlock({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Si el navegador bloquea el portapapeles, simplemente no marcamos "copiado".
    }
  };

  return (
    <div className="ac-code-block">
      <div className="ac-code-block__bar">
        <span>código</span>
        <button type="button" className="ac-code-block__copy" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  );
}

/**
 * Renderiza el contenido del mensaje según su tipo real.
 */
function MessageContent({ type, content }) {
  switch (type) {
    case "code":
      return <CodeBlock content={content} />;
    case "image":
      return (
        <img
          src={content}
          alt="Imagen enviada por Athena Core"
          className="ac-bubble__image"
          loading="lazy"
        />
      );
    case "web":
      return (
        <a href={content} target="_blank" rel="noreferrer" className="ac-bubble__link">
          {content}
        </a>
      );
    case "error":
      return <p className="ac-bubble__error-text">{content}</p>;
    case "text":
    default:
      return <p className="ac-bubble__text">{content}</p>;
  }
}

export default function MessageBubble({ message }) {
  const { role, type, content, timestamp } = message;
  const isUser = role === "user";
  const isError = type === "error";

  return (
    <div className={`ac-message ${isUser ? "ac-message--user" : "ac-message--athena"}`}>
      <div className="ac-message__avatar" aria-hidden="true">
        {isUser ? (
          <User size={16} />
        ) : isError ? (
          <AlertTriangle size={16} />
        ) : (
          <Sparkles size={16} />
        )}
      </div>

      <div className="ac-message__body">
        <div
          className={`ac-bubble ${isUser ? "ac-bubble--user" : "ac-bubble--athena"} ${
            isError ? "ac-bubble--error" : ""
          }`}
        >
          <MessageContent type={type} content={content} />
        </div>
        <span className={`ac-message__time ${isUser ? "ac-message__time--right" : ""}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
