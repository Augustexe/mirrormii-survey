// Link payloads for the friend game. A payload is base64url(UTF-8 JSON) plus "." and 8 hex of its SHA-256, carried
// in the URL fragment (#play=... from owner to friend, #reply=... back), so it never reaches a server log.
// Everything decoded here is untrusted: size, charset, checksum and JSON shape are checked before any field is read.
import { sha256Hex } from "./sha256.js";

export const MAX_PAYLOAD = 6000;

export class LinkError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(text) {
  const padded = text.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((text.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function encodePayload(obj) {
  const body = toBase64Url(JSON.stringify(obj));
  return `${body}.${sha256Hex(body).slice(0, 8)}`;
}

export function decodePayload(raw) {
  if (typeof raw !== "string") throw new LinkError("missing", "This link is empty.");
  const text = raw.trim();
  if (!text) throw new LinkError("missing", "This link is empty.");
  if (text.length > MAX_PAYLOAD) throw new LinkError("too_long", "This link is too long to be a Genii link.");
  const m = /^([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec(text);
  if (!m) throw new LinkError("malformed", "This link looks cut off or changed.");
  if (sha256Hex(m[1]).slice(0, 8) !== m[2]) throw new LinkError("checksum", "This link looks cut off or changed.");
  let value;
  try { value = JSON.parse(fromBase64Url(m[1])); } catch { throw new LinkError("malformed", "This link looks cut off or changed."); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new LinkError("malformed", "This link looks cut off or changed.");
  return value;
}

// Reads #play=... or #reply=... from a location hash (or a pasted full URL). Returns { kind, payload } or null.
export function readHash(input) {
  const text = String(input || "");
  const at = text.indexOf("#");
  const hash = at >= 0 ? text.slice(at + 1) : text;
  const m = /^(play|reply)=(.*)$/s.exec(hash);
  return m ? { kind: m[1], payload: m[2] } : null;
}

export function linkFor(kind, payload, base) {
  const origin = base ?? (typeof location !== "undefined" ? `${location.origin}${location.pathname}` : "");
  return `${origin}#${kind}=${payload}`;
}
