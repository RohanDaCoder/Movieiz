import { type AsyncState, useAsync } from "@/hooks/useAsync";
import type {
	DiscoverQuery,
	Genre,
	MediaItem,
	MediaType,
	MovieDetailsFull,
	SeasonFull,
	TvDetailsFull,
} from "@/lib/types";
import { catalog } from "@/services/catalog";

export function useTrending(media: MediaType): AsyncState<MediaItem[]> {
	return useAsync(() => catalog.trending(media, "week", 1), [media]);
}

export function useTopRated(media: MediaType): AsyncState<MediaItem[]> {
	return useAsync(() => catalog.topRated(media, 1), [media]);
}

export function useSearch(query: string): AsyncState<MediaItem[]> {
	const q = query.trim();
	return useAsync(() => (q ? catalog.search(q, 1) : Promise.resolve([])), [q]);
}

export function useDiscover(
	q: DiscoverQuery | null,
): AsyncState<{ items: MediaItem[]; totalPages: number }> {
	const key = q ? JSON.stringify(q) : "";
	return useAsync(
		() =>
			q ? catalog.discover(q) : Promise.resolve({ items: [], totalPages: 0 }),
		[key],
	);
}

export function useMovieDetails(id: number): AsyncState<MovieDetailsFull> {
	return useAsync(() => catalog.movieDetails(id), [id]);
}

export function useTvDetails(id: number): AsyncState<TvDetailsFull> {
	return useAsync(() => catalog.tvDetails(id), [id]);
}

export function useSeason(
	seriesId: number,
	seasonNumber: number | null,
): AsyncState<SeasonFull> {
	return useAsync(
		() =>
			seasonNumber === null
				? Promise.resolve({ name: "", episodes: [] })
				: catalog.season(seriesId, seasonNumber),
		[seriesId, seasonNumber],
	);
}

export function useGenres(media: MediaType): AsyncState<Genre[]> {
	return useAsync(() => catalog.genres(media), [media]);
}
