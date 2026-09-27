import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  appearanceBootstrapScript,
  appearanceOptions,
  appearanceStorageKey,
  applyAppearance,
  defaultAppearance,
  presets,
} from "./appearance";
import { createAppearanceStore } from "./theme-store";

function fixture({
  saved,
  dark = false,
  denied = false,
}: {
  saved?: string;
  dark?: boolean;
  denied?: boolean;
} = {}) {
  const data = new Map<string, string>();
  if (saved) {
    data.set(appearanceStorageKey, saved);
  }
  const events = new EventTarget();
  const media = Object.assign(new EventTarget(), { matches: dark });
  const storage = {
    getItem(key: string) {
      if (denied) {
        throw new Error("Denied");
      }
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (denied) {
        throw new Error("Denied");
      }
      data.set(key, value);
    },
  };
  const store = createAppearanceStore(
    () => storage,
    () => events,
    () => media,
  );
  return { data, events, media, storage, store };
}

describe("portfolio appearance parity", () => {
  it("restores saved appearance, persists all preferences, and resets", () => {
    const { store, data } = fixture({
      saved: JSON.stringify({ ...defaultAppearance, mode: "dark" }),
    });
    expect(store.getSnapshot().mode).toBe("dark");
    store.update({ size: "larger", motion: "reduce" });
    store.selectPreset("editorial");
    store.update({ accent: "ocean", font: "mono" });
    const reloaded = fixture({ saved: data.get(appearanceStorageKey) }).store;
    expect(reloaded.getSnapshot()).toMatchObject({
      mode: "dark",
      preset: "editorial",
      accent: "ocean",
      font: "mono",
      size: "larger",
      motion: "reduce",
    });
    store.reset();
    expect(JSON.parse(data.get(appearanceStorageKey)!)).toEqual(defaultAppearance);
  });

  it("follows the system and other tabs, but honors explicit mode", () => {
    const { store, data, events, media } = fixture();
    const unsubscribe = store.subscribe(() => {});
    media.matches = true;
    media.dispatchEvent(new Event("change"));
    expect(store.getSnapshot().resolvedMode).toBe("dark");
    store.update({ mode: "light" });
    media.dispatchEvent(new Event("change"));
    expect(store.getSnapshot().resolvedMode).toBe("light");
    data.set(appearanceStorageKey, JSON.stringify({ ...defaultAppearance, font: "serif" }));
    events.dispatchEvent(Object.assign(new Event("storage"), { key: appearanceStorageKey }));
    expect(store.getSnapshot()).toMatchObject({ font: "serif", resolvedMode: "dark" });
    const snapshot = store.getSnapshot();
    unsubscribe();
    media.matches = false;
    media.dispatchEvent(new Event("change"));
    expect(store.getSnapshot()).toBe(snapshot);
  });

  it.each(["{broken", "null", '{"version":99,"font":"comic"}'])(
    "recovers from invalid storage: %s",
    (saved) => {
      expect(fixture({ saved }).store.getSnapshot()).toMatchObject(defaultAppearance);
    },
  );

  it("keeps preferences usable without browser storage", () => {
    const { store } = fixture({ denied: true });
    store.selectPreset("goofball");
    store.toggle();
    expect(store.getSnapshot()).toMatchObject({
      font: "comic",
      resolvedMode: "dark",
      storageAvailable: false,
    });
  });

  it("applies the same attributes before paint and after hydration for every theme/mode", () => {
    for (const preset of presets) {
      for (const mode of appearanceOptions.mode) {
        const value = {
          ...defaultAppearance,
          preset: preset.id,
          accent: preset.accent,
          font: preset.font,
          mode,
        };
        const { store, storage, media } = fixture({
          saved: JSON.stringify(value),
          dark: true,
        });
        const root = document.createElement("html");
        runInNewContext(appearanceBootstrapScript(), {
          document: { documentElement: root },
          localStorage: storage,
          window: { matchMedia: () => media },
        });
        const hydrated = document.createElement("html");
        applyAppearance(hydrated, store.getSnapshot(), true);
        expect({ ...root.dataset }).toEqual({ ...hydrated.dataset });
      }
    }
  });
});
