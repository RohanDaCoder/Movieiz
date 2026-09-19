import { describe, expect, it } from "vitest";
import { CatalogService } from "@/services/catalog";

describe("CatalogService.normalizeMovie", () => {
	it("maps SDK movie fields to MediaItem", () => {
		const item = CatalogService.normalizeMovie({
			id: 11,
			title: "Star Wars",
			overview: "A long time ago",
			poster_path: "/p.jpg",
			backdrop_path: "/b.jpg",
			release_date: "1977-05-25",
			vote_average: 8.2,
			vote_count: 22061,
			genre_ids: [12, 28],
		});
		expect(item).toEqual({
			mediaType: "movie",
			id: 11,
			title: "Star Wars",
			overview: "A long time ago",
			posterPath: "/p.jpg",
			backdropPath: "/b.jpg",
			date: "1977-05-25",
			voteAverage: 8.2,
			voteCount: 22061,
			genreIds: [12, 28],
		});
	});
});

describe("CatalogService.normalizeTv", () => {
	it("maps SDK tv fields to MediaItem", () => {
		const item = CatalogService.normalizeTv({
			id: 1399,
			name: "Game of Thrones",
			overview: "Winter is coming",
			poster_path: "/p.jpg",
			backdrop_path: null,
			first_air_date: "2011-04-17",
			vote_average: 8.4,
			vote_count: 21390,
			genre_ids: [18],
		});
		expect(item.mediaType).toBe("tv");
		expect(item.title).toBe("Game of Thrones");
		expect(item.date).toBe("2011-04-17");
		expect(item.backdropPath).toBeNull();
	});
});

describe("CatalogService.buildDiscoverParams", () => {
	it("maps DiscoverQuery for movies", () => {
		expect(
			CatalogService.buildDiscoverParams({
				type: "movie",
				year: 2024,
				genreIds: [28, 12],
				minRating: 7,
				sort: "popularity.desc",
				page: 2,
			}),
		).toEqual({
			sort_by: "popularity.desc",
			year: 2024,
			with_genres: "28,12",
			"vote_average.gte": 7,
			"vote_count.gte": 50,
			page: 2,
		});
	});
	it("maps DiscoverQuery for tv", () => {
		expect(
			CatalogService.buildDiscoverParams({
				type: "tv",
				year: 2024,
				genreIds: [],
				page: 1,
			}),
		).toEqual({
			sort_by: "popularity.desc",
			first_air_date_year: 2024,
			page: 1,
		});
	});
});
