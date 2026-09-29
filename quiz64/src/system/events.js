// geniiEvents: a tiny event bus so any component can make Genii's light react (section 6, A-07).
// geniiEvents.emit("noted" | "thinking" | "sure", detail); const off = geniiEvents.on((name, detail) => ...); off();

export const GENII_EVENTS = Object.freeze(["noted", "thinking", "sure"]);

export function createEventBus() {
  const listeners = new Set();
  return Object.freeze({
    emit(name, detail) {
      for (const fn of [...listeners]) {
        try { fn(name, detail); } catch (err) { if (typeof console !== "undefined") console.error(err); }
      }
    },
    on(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get size() { return listeners.size; },
  });
}

export const geniiEvents = createEventBus();
