import { beforeEach, describe, expect, it } from "vitest";
import { ProgressStore, WatchlistStore } from "@/services/storage";

class MemoryStorage implements Storage {
	private map = new Map<string, string>();
	get length(): number {
		return this.map.size;
	}
	clear(): void {
		this.map.clear();
	}
	getItem(key: string): string | null {
		return this.map.get(key) ?? null;
	}
	key(index: number): string | null {
		return [...this.map.keys()][index] ?? null;
	}
	removeItem(key: string): void {
		this.map.delete(key);
	}
	setItem(key: string, value: string): void {
		this.map.set(key, value);
	}
}

describe("WatchlistStore", () => {
	let store: WatchlistStore;
	beforeEach(() => {
		store = new WatchlistStore(new MemoryStorage());
	});
	it("toggles entries", () => {
		const entry = {
			mediaType: "movie" as const,
			id: 11,
			title: "Star Wars",
			posterPath: "/p.jpg",
			addedAt: 1,
		};
		expect(store.toggle(entry)).toBe(true);
		expect(store.isSaved("movie", 11)).toBe(true);
		expect(store.toggle(entry)).toBe(false);
		expect(store.isSaved("movie", 11)).toBe(false);
	});
	it("survives corrupt JSON", () => {
		const storage = new MemoryStorage();
		storage.setItem("movieiz:watchlist", "not-json{{{");
		const s = new WatchlistStore(storage);
		expect(s.all()).toEqual([]);
	});
});

describe("ProgressStore", () => {
	it("upserts by composite key and lists recent first", () => {
		const store = new ProgressStore(new MemoryStorage());
		const now = Date.now();
		store.upsert({
			mediaType: "tv",
			id: 1,
			title: "A",
			posterPath: null,
			season: 1,
			episode: 1,
			time: 10,
			duration: 100,
			updatedAt: now,
		});
		store.upsert({
			mediaType: "tv",
			id: 1,
			title: "A",
			posterPath: null,
			season: 1,
			episode: 2,
			time: 5,
			duration: 100,
			updatedAt: now + 1,
		});
		expect(store.forMedia("tv", 1)).toHaveLength(2);
		expect(store.recent(5)[0]?.episode).toBe(2);
		expect(store.get("tv", 1, 1, 1)?.time).toBe(10);
	});
	it("prunes finished items", () => {
		const store = new ProgressStore(new MemoryStorage());
		store.upsert({
			mediaType: "movie",
			id: 9,
			title: "B",
			posterPath: null,
			time: 95,
			duration: 100,
			updatedAt: Date.now(),
		});
		expect(store.get("movie", 9)).toBeUndefined();
	});
});
