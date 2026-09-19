import type { TMDBError } from "@lorenzopant/tmdb";
import { TMDB } from "@lorenzopant/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

if (!apiKey) {
	throw new Error(
		"Missing VITE_TMDB_API_KEY. Copy .env.example to .env and add your TMDB Bearer read token.",
	);
}

export const tmdb = new TMDB(apiKey, {
	language: "en-US",
	rate_limit: true,
	cache: true,
	images: {
		secure_images_url: true,
		default_image_sizes: {
			posters: "w500",
			backdrops: "w1280",
			profiles: "w185",
			still: "w300",
		},
	},
});

export type {
	DiscoverMovieParams,
	DiscoverTVParams,
	Genre as SdkGenre,
	MovieDetails,
	MultiSearchResultItem,
	TVSeriesDetails,
} from "@lorenzopant/tmdb";
export type { TMDBError };
