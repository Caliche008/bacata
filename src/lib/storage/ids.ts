/**
 * Generación de identificadores idempotentes para eventos de la cola de
 * sincronización (`colaSync`). Un id estable por evento evita que un reintento
 * de Fase 2 duplique o pierda datos.
 */

/**
 * Devuelve un UUID v4. Usa `crypto.randomUUID()` cuando está disponible
 * (navegador seguro, Node 19+/jsdom). Incluye un fallback defensivo basado en
 * `crypto.getRandomValues` para entornos sin `randomUUID`.
 */
export function newEventId(): string {
  const cryptoObj = globalThis.crypto;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj?.getRandomValues) {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16));
    // Marca versión (4) y variante (RFC 4122) sobre bytes aleatorios.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
    return (
      `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-` +
      `${hex[4]}${hex[5]}-` +
      `${hex[6]}${hex[7]}-` +
      `${hex[8]}${hex[9]}-` +
      `${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
    );
  }

  // Último recurso: suficientemente único para un id de evento local.
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
