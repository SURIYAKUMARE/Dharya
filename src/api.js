// Shared API helper — falls back to localStorage if API is unavailable
const BASE = "/api";

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("API unavailable, using localStorage fallback:", err.message);
    return null;
  }
}

// ── Generic key/value ──────────────────────────────────────────
export async function dbGet(key, fallbackDefault = null) {
  const val = await apiFetch(`/data?key=${encodeURIComponent(key)}`);
  if (val !== null) return val;
  // localStorage fallback
  try { return JSON.parse(localStorage.getItem(key)) ?? fallbackDefault; } catch { return fallbackDefault; }
}

export async function dbSet(key, value) {
  // Always write localStorage immediately (optimistic)
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  await apiFetch("/data", {
    method: "POST",
    body: JSON.stringify({ key, value }),
  });
}

// ── Dreams ────────────────────────────────────────────────────
export async function getDreams() {
  const d = await apiFetch("/dreams");
  if (d && d.inputs) return d;
  // localStorage fallback
  return {
    inputs:  JSON.parse(localStorage.getItem("dd_inputs")  || '["","","","",""]'),
    cats:    JSON.parse(localStorage.getItem("dd_cats")    || '["","","","",""]'),
    prog:    JSON.parse(localStorage.getItem("dd_prog")    || '[0,0,0,0,0]'),
    savedAt: localStorage.getItem("dd_savedat") || null,
  };
}

export async function saveDreams(inputs, cats, prog, savedAt) {
  // optimistic localStorage
  localStorage.setItem("dd_inputs",  JSON.stringify(inputs));
  localStorage.setItem("dd_cats",    JSON.stringify(cats));
  localStorage.setItem("dd_prog",    JSON.stringify(prog));
  localStorage.setItem("dd_savedat", savedAt ? new Date(savedAt).toISOString() : "");
  await apiFetch("/dreams", {
    method: "POST",
    body: JSON.stringify({ inputs, cats, prog, savedAt }),
  });
}
