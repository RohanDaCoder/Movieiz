import { describe, expect, it } from "vitest";
import { formatRating, formatRuntime, formatYear } from "@/lib/format";

describe("formatYear", () => {
	it("extracts the year", () => {
		expect(formatYear("2024-03-15")).toBe("2024");
	});
	it("returns empty string for missing dates", () => {
		expect(formatYear(undefined)).toBe("");
	});
});

describe("formatRating", () => {
	it("rounds to one decimal", () => {
		expect(formatRating(7.456)).toBe("7.5");
	});
	it("renders zero ratings as em dash", () => {
		expect(formatRating(0)).toBe("—");
	});
});

describe("formatRuntime", () => {
	it("formats minutes as h min", () => {
		expect(formatRuntime(121)).toBe("2h 1m");
	});
	it("returns empty string when unknown", () => {
		expect(formatRuntime(undefined)).toBe("");
	});
});
