import { MIN_VOTES_FOR_RATED_SORT, TOP_CAST_COUNT } from "@/lib/constants";
import type {
	DiscoverQuery,
	Episode,
	Genre,
	MediaItem,
	MediaType,
	MovieDetailsFull,
	Season,
	SeasonFull,
	TvDetailsFull,
} from "@/lib/types";
import { tmdb } from "@/services/tmdb";

interface RawMovie {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
}

interface RawTv {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	first_air_date: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
}

export class CatalogService {
	static normalizeMovie(raw: RawMovie): MediaItem {
		return {
			mediaType: "movie",
			id: raw.id,
			title: raw.title,
			overview: raw.overview ?? "",
			posterPath: raw.poster_path,
			backdropPath: raw.backdrop_path,
			date: raw.release_date ?? "",
			voteAverage: raw.vote_average ?? 0,
			voteCount: raw.vote_count ?? 0,
			genreIds: raw.genre_ids ?? [],
		};
	}

	static normalizeTv(raw: RawTv): MediaItem {
		return {
			mediaType: "tv",
			id: raw.id,
			title: raw.name,
			overview: raw.overview ?? "",
			posterPath: raw.poster_path,
			backdropPath: raw.backdrop_path,
			date: raw.first_air_date ?? "",
			voteAverage: raw.vote_average ?? 0,
			voteCount: raw.vote_count ?? 0,
			genreIds: raw.genre_ids ?? [],
		};
	}

	static buildDiscoverParams(
		q: DiscoverQuery,
	): Record<string, string | number> {
		const params: Record<string, string | number> = {
			sort_by: q.sort ?? "popularity.desc",
			page: q.page,
		};
		if (q.type === "movie") {
			if (q.year !== undefined) params.year = q.year;
		} else {
			if (q.year !== undefined) params.first_air_date_year = q.year;
		}
		if (q.genreIds.length > 0) params.with_genres = q.genreIds.join(",");
		if (q.minRating !== undefined && q.minRating > 0) {
			params["vote_average.gte"] = q.minRating;
			params["vote_count.gte"] = MIN_VOTES_FOR_RATED_SORT;
		}
		return params;
	}

	private imageUrl(
		kind: "poster" | "backdrop" | "profile" | "still",
		path: string | null,
		size?: string,
	): string | null {
		if (!path) return null;
		switch (kind) {
			case "poster":
				return tmdb.images.poster(path, (size as "w342" | "w500") ?? "w500");
			case "backdrop":
				return tmdb.images.backdrop(
					path,
					(size as "w780" | "w1280" | "original") ?? "w1280",
				);
			case "profile":
				return tmdb.images.profile(path, "w185");
			case "still":
				return tmdb.images.still(path, "w300");
		}
	}

	poster(path: string | null, size: "w342" | "w500" = "w500"): string | null {
		return this.imageUrl("poster", path, size);
	}

	backdrop(
		path: string | null,
		size: "w780" | "w1280" | "original" = "w1280",
	): string | null {
		return this.imageUrl("backdrop", path, size);
	}

	profile(path: string | null): string | null {
		return this.imageUrl("profile", path);
	}

	still(path: string | null): string | null {
		return this.imageUrl("still", path);
	}

	async trending(
		media: MediaType,
		window: "day" | "week" = "week",
		page = 1,
	): Promise<MediaItem[]> {
		if (media === "movie") {
			const { results } = await tmdb.trending.movies({
				time_window: window,
				page,
			});
			return results.map((m) =>
				CatalogService.normalizeMovie(m as unknown as RawMovie),
			);
		}
		const { results } = await tmdb.trending.tv({ time_window: window, page });
		return results.map((t) =>
			CatalogService.normalizeTv(t as unknown as RawTv),
		);
	}

	async topRated(media: MediaType, page = 1): Promise<MediaItem[]> {
		if (media === "movie") {
			const { results } = await tmdb.movie_lists.top_rated({ page });
			return results.map((m) =>
				CatalogService.normalizeMovie(m as unknown as RawMovie),
			);
		}
		const { results } = await tmdb.tv_lists.top_rated({ page });
		return results.map((t) =>
			CatalogService.normalizeTv(t as unknown as RawTv),
		);
	}

	async search(query: string, page = 1): Promise<MediaItem[]> {
		const { results } = await tmdb.search.multi({
			query,
			page,
			include_adult: false,
		});
		const items: MediaItem[] = [];
		for (const r of results) {
			if (r.media_type === "movie")
				items.push(CatalogService.normalizeMovie(r as unknown as RawMovie));
			else if (r.media_type === "tv")
				items.push(CatalogService.normalizeTv(r as unknown as RawTv));
		}
		return items;
	}

	async discover(
		q: DiscoverQuery,
	): Promise<{ items: MediaItem[]; totalPages: number }> {
		const params = CatalogService.buildDiscoverParams(q);
		if (q.type === "movie") {
			const res = await tmdb.discover.movie(params);
			return {
				items: res.results.map((m) =>
					CatalogService.normalizeMovie(m as unknown as RawMovie),
				),
				totalPages: res.total_pages,
			};
		}
		const res = await tmdb.discover.tv(params);
		return {
			items: res.results.map((t) =>
				CatalogService.normalizeTv(t as unknown as RawTv),
			),
			totalPages: res.total_pages,
		};
	}

	async genres(media: MediaType): Promise<Genre[]> {
		const res =
			media === "movie"
				? await tmdb.genres.movie_list()
				: await tmdb.genres.tv_list();
		return res.genres.map((g) => ({ id: g.id, name: g.name }));
	}

	async movieDetails(id: number): Promise<MovieDetailsFull> {
		const d = await tmdb.movies.details({
			movie_id: id,
			append_to_response: ["credits"],
		});
		return {
			...CatalogService.normalizeMovie(d as unknown as RawMovie),
			mediaType: "movie",
			runtime: d.runtime ?? null,
			tagline: d.tagline ?? "",
			genres: (d.genres ?? []).map((g) => ({ id: g.id, name: g.name })),
			cast: (d.credits?.cast ?? []).slice(0, TOP_CAST_COUNT).map((c) => ({
				name: c.name,
				character: c.character ?? "",
				profilePath: c.profile_path ?? null,
			})),
		};
	}

	async tvDetails(id: number): Promise<TvDetailsFull> {
		const d = await tmdb.tv_series.details({
			series_id: id,
			append_to_response: ["credits"],
		});
		const seasons: Season[] = (d.seasons ?? [])
			.filter((s) => s.season_number > 0)
			.map((s) => ({
				seasonNumber: s.season_number,
				name: s.name,
				episodeCount: s.episode_count,
				posterPath: s.poster_path ?? null,
			}));
		return {
			...CatalogService.normalizeTv(d as unknown as RawTv),
			mediaType: "tv",
			seasons,
			tagline: d.tagline ?? "",
			genres: (d.genres ?? []).map((g) => ({ id: g.id, name: g.name })),
			cast: (d.credits?.cast ?? []).slice(0, TOP_CAST_COUNT).map((c) => ({
				name: c.name,
				character: c.character ?? "",
				profilePath: c.profile_path ?? null,
			})),
			numberOfSeasons: d.number_of_seasons ?? seasons.length,
		};
	}

	async season(seriesId: number, seasonNumber: number): Promise<SeasonFull> {
		const s = await tmdb.tv_seasons.details({
			series_id: seriesId,
			season_number: seasonNumber,
		});
		const episodes: Episode[] = (s.episodes ?? []).map((e) => ({
			episodeNumber: e.episode_number,
			seasonNumber: e.season_number,
			name: e.name,
			overview: e.overview ?? "",
			stillPath: e.still_path ?? null,
			airDate: e.air_date ?? "",
		}));
		return { name: s.name, episodes };
	}
}

export const catalog = new CatalogService();
