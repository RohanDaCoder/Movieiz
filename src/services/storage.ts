import { PROGRESS_PRUNE_DAYS, WATCHED_THRESHOLD } from "@/lib/constants";
import type { MediaType, WatchlistEntry, WatchProgress } from "@/lib/types";

function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function defaultBackend(): Storage {
	if (typeof localStorage !== "undefined") return localStorage;
	const map = new Map<string, string>();
	return {
		get length() {
			return map.size;
		},
		clear() {
			map.clear();
		},
		getItem(key: string): string | null {
			return map.get(key) ?? null;
		},
		key(index: number): string | null {
			return [...map.keys()][index] ?? null;
		},
		removeItem(key: string): void {
			map.delete(key);
		},
		setItem(key: string, value: string): void {
			map.set(key, String(value));
		},
	} as Storage;
}

export abstract class LocalStore<T> {
	protected abstract key: string;
	private backend: Storage;

	constructor(backend?: Storage) {
		this.backend = backend ?? defaultBackend();
	}

	protected load(): T[] {
		return safeParse<T[]>(this.backend.getItem(this.key), []);
	}

	protected save(items: T[]): void {
		this.backend.setItem(this.key, JSON.stringify(items));
	}

	clear(): void {
		this.backend.removeItem(this.key);
	}
}

export class WatchlistStore extends LocalStore<WatchlistEntry> {
	protected key = "movieiz:watchlist";

	all(): WatchlistEntry[] {
		return this.load().sort((a, b) => b.addedAt - a.addedAt);
	}

	isSaved(mediaType: MediaType, id: number): boolean {
		return this.load().some((e) => e.mediaType === mediaType && e.id === id);
	}

	toggle(entry: WatchlistEntry): boolean {
		const items = this.load();
		const idx = items.findIndex(
			(e) => e.mediaType === entry.mediaType && e.id === entry.id,
		);
		if (idx >= 0) {
			items.splice(idx, 1);
			this.save(items);
			return false;
		}
		this.save([...items, entry]);
		return true;
	}

	remove(mediaType: MediaType, id: number): void {
		this.save(
			this.load().filter((e) => !(e.mediaType === mediaType && e.id === id)),
		);
	}
}

function progressKey(
	p: Pick<WatchProgress, "mediaType" | "id" | "season" | "episode">,
): string {
	return `${p.mediaType}:${p.id}:${p.season ?? 0}:${p.episode ?? 0}`;
}

export class ProgressStore extends LocalStore<WatchProgress> {
	protected key = "movieiz:progress";

	private live(items: WatchProgress[]): WatchProgress[] {
		const cutoff = Date.now() - PROGRESS_PRUNE_DAYS * 24 * 60 * 60 * 1000;
		return items.filter(
			(p) =>
				p.updatedAt >= cutoff &&
				(p.duration <= 0 || p.time / p.duration < WATCHED_THRESHOLD),
		);
	}

	upsert(p: WatchProgress): void {
		const items = this.live(this.load()).filter(
			(e) => progressKey(e) !== progressKey(p),
		);
		this.save([...items, p]);
	}

	get(
		mediaType: MediaType,
		id: number,
		season?: number,
		episode?: number,
	): WatchProgress | undefined {
		return this.live(this.load()).find(
			(p) =>
				p.mediaType === mediaType &&
				p.id === id &&
				(p.season ?? 0) === (season ?? 0) &&
				(p.episode ?? 0) === (episode ?? 0),
		);
	}

	forMedia(mediaType: MediaType, id: number): WatchProgress[] {
		return this.live(this.load()).filter(
			(p) => p.mediaType === mediaType && p.id === id,
		);
	}

	remove(
		mediaType: MediaType,
		id: number,
		season?: number,
		episode?: number,
	): void {
		const key = `${mediaType}:${id}:${season ?? 0}:${episode ?? 0}`;
		this.save(this.load().filter((p) => progressKey(p) !== key));
	}

	recent(limit: number): WatchProgress[] {
		return this.live(this.load())
			.sort((a, b) => b.updatedAt - a.updatedAt)
			.slice(0, limit);
	}
}

export const watchlist = new WatchlistStore();
export const progress = new ProgressStore();
