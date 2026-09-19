export type MediaType = "movie" | "tv";

export interface MovieItem {
	mediaType: "movie";
	id: number;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	date: string;
	voteAverage: number;
	voteCount: number;
	genreIds: number[];
}

export interface TvItem {
	mediaType: "tv";
	id: number;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	date: string;
	voteAverage: number;
	voteCount: number;
	genreIds: number[];
}

export type MediaItem = MovieItem | TvItem;

export type DiscoverSort =
	| "popularity.desc"
	| "popularity.asc"
	| "vote_average.desc"
	| "vote_average.asc"
	| "primary_release_date.desc"
	| "primary_release_date.asc"
	| "first_air_date.desc"
	| "first_air_date.asc"
	| "title.asc";

export interface DiscoverQuery {
	type: MediaType;
	year?: number;
	genreIds: number[];
	minRating?: number;
	sort?: DiscoverSort;
	page: number;
}

export interface Genre {
	id: number;
	name: string;
}

export interface Season {
	seasonNumber: number;
	name: string;
	episodeCount: number;
	posterPath: string | null;
}

export interface Episode {
	episodeNumber: number;
	seasonNumber: number;
	name: string;
	overview: string;
	stillPath: string | null;
	airDate: string;
}

export interface CastMember {
	name: string;
	character: string;
	profilePath: string | null;
}

export interface MovieDetailsFull extends MovieItem {
	runtime: number | null;
	tagline: string;
	genres: Genre[];
	cast: CastMember[];
}

export interface TvDetailsFull extends TvItem {
	seasons: Season[];
	tagline: string;
	genres: Genre[];
	cast: CastMember[];
	numberOfSeasons: number;
}

export interface SeasonFull {
	name: string;
	episodes: Episode[];
}

export interface WatchProgress {
	mediaType: MediaType;
	id: number;
	title: string;
	posterPath: string | null;
	season?: number;
	episode?: number;
	time: number;
	duration: number;
	updatedAt: number;
}

export interface WatchlistEntry {
	mediaType: MediaType;
	id: number;
	title: string;
	posterPath: string | null;
	addedAt: number;
}
