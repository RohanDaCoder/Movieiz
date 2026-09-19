import { describe, expect, it, vi } from "vitest";
import { PlayerController } from "@/services/player";

function message(
	type: string,
	extra: Record<string, unknown> = {},
): MessageEvent {
	return {
		origin: "https://cinesrc.st",
		data: { type, ...extra },
	} as MessageEvent;
}

describe("PlayerController.handleMessage", () => {
	it("routes timeupdate to onTime", () => {
		const onTime = vi.fn();
		const c = new PlayerController({
			onTime,
			onEnded: vi.fn(),
			onNextEpisode: vi.fn(),
			onError: vi.fn(),
		});
		c.handleMessage(
			message("cinesrc:timeupdate", { currentTime: 12.5, duration: 100 }),
		);
		expect(onTime).toHaveBeenCalledWith(12.5, 100);
	});
	it("routes ended and error", () => {
		const onEnded = vi.fn();
		const onError = vi.fn();
		const c = new PlayerController({
			onTime: vi.fn(),
			onEnded,
			onNextEpisode: vi.fn(),
			onError,
		});
		c.handleMessage(message("cinesrc:ended"));
		c.handleMessage(message("cinesrc:error", { error: "no stream" }));
		expect(onEnded).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith("no stream");
	});
	it("routes internal episode navigation without iframe replacement", () => {
		const onNextEpisode = vi.fn();
		const c = new PlayerController({
			onTime: vi.fn(),
			onEnded: vi.fn(),
			onNextEpisode,
			onError: vi.fn(),
		});
		c.handleMessage(
			message("cinesrc:nextepisode", {
				season: 2,
				episode: 3,
				internalNavigation: true,
			}),
		);
		expect(onNextEpisode).toHaveBeenCalledWith(2, 3);
	});
	it("ignores foreign origins", () => {
		const onTime = vi.fn();
		const c = new PlayerController({
			onTime,
			onEnded: vi.fn(),
			onNextEpisode: vi.fn(),
			onError: vi.fn(),
		});
		c.handleMessage({
			origin: "https://evil.example",
			data: { type: "cinesrc:timeupdate" },
		} as MessageEvent);
		expect(onTime).not.toHaveBeenCalled();
	});
});
