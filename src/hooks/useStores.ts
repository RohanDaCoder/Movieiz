import { useCallback, useState } from "react";
import type { MediaType, WatchlistEntry, WatchProgress } from "@/lib/types";
import { progress, watchlist } from "@/services/storage";

export function useWatchlist() {
	const [version, setVersion] = useState(0);
	const refresh = useCallback(() => setVersion((v) => v + 1), []);
	void version;

	const toggle = useCallback(
		(entry: WatchlistEntry) => {
			const saved = watchlist.toggle(entry);
			refresh();
			return saved;
		},
		[refresh],
	);

	return {
		items: watchlist.all(),
		// biome-ignore lint/correctness/useExhaustiveDependencies: version dep intentionally re-renders consumers on toggle
		isSaved: useCallback(
			(mediaType: MediaType, id: number) => watchlist.isSaved(mediaType, id),
			[version],
		),
		toggle,
		remove: useCallback(
			(mediaType: MediaType, id: number) => {
				watchlist.remove(mediaType, id);
				refresh();
			},
			[refresh],
		),
		clear: useCallback(() => {
			watchlist.clear();
			refresh();
		}, [refresh]),
	};
}

export function useProgress() {
	const [version, setVersion] = useState(0);
	const refresh = useCallback(() => setVersion((v) => v + 1), []);
	void version;

	return {
		recent: (limit: number): WatchProgress[] => progress.recent(limit),
		get: (
			mediaType: MediaType,
			id: number,
			season?: number,
			episode?: number,
		) => progress.get(mediaType, id, season, episode),
		upsert: (p: WatchProgress) => {
			progress.upsert(p);
			refresh();
		},
		remove: (
			mediaType: MediaType,
			id: number,
			season?: number,
			episode?: number,
		) => {
			progress.remove(mediaType, id, season, episode);
			refresh();
		},
	};
}
