import { describe, expect, it } from "vitest";
import { EmbedUrlBuilder } from "@/services/embed";

describe("EmbedUrlBuilder.movie", () => {
	it("builds the base movie URL", () => {
		expect(EmbedUrlBuilder.movie(1084242)).toBe(
			"https://cinesrc.st/embed/movie/1084242",
		);
	});
	it("appends back and resume time", () => {
		const url = new URL(
			EmbedUrlBuilder.movie(11, {
				back: "https://movieiz.netlify.app/movie/11",
				resumeSeconds: 125,
			}),
		);
		expect(url.searchParams.get("back")).toBe(
			"https://movieiz.netlify.app/movie/11",
		);
		expect(url.searchParams.get("t")).toBe("125");
	});
});

describe("EmbedUrlBuilder.episode", () => {
	it("builds the tv URL with s/e aliases", () => {
		expect(EmbedUrlBuilder.episode(1396, 1, 2)).toBe(
			"https://cinesrc.st/embed/tv/1396?s=1&e=2",
		);
	});
	it("disables autonext on demand", () => {
		const url = new URL(
			EmbedUrlBuilder.episode(1396, 1, 2, { autonext: false }),
		);
		expect(url.searchParams.get("autonext")).toBe("false");
	});
});
