export const CINESRC_ORIGIN = "https://cinesrc.st";

export interface PlayerHandlers {
	onTime(time: number, duration: number): void;
	onEnded(): void;
	onNextEpisode(season: number, episode: number): void;
	onError(message: string): void;
}

export class PlayerController {
	private listener: ((event: MessageEvent) => void) | null = null;
	private handlers: PlayerHandlers;

	constructor(handlers: PlayerHandlers) {
		this.handlers = handlers;
	}

	attach(_iframe: HTMLIFrameElement): void {
		this.detach();
		this.listener = (event: MessageEvent) => this.handleMessage(event);
		window.addEventListener("message", this.listener);
	}

	detach(): void {
		if (this.listener) window.removeEventListener("message", this.listener);
		this.listener = null;
	}

	handleMessage(event: MessageEvent): void {
		if (event.origin !== CINESRC_ORIGIN) return;
		const data = event.data as { type?: string } & Record<string, unknown>;
		if (!data || typeof data.type !== "string") return;
		switch (data.type) {
			case "cinesrc:timeupdate": {
				const time = Number(data.currentTime ?? 0);
				const duration = Number(data.duration ?? 0);
				if (duration > 0) this.handlers.onTime(time, duration);
				break;
			}
			case "cinesrc:ended":
				this.handlers.onEnded();
				break;
			case "cinesrc:nextepisode": {
				const season = Number(data.season ?? 0);
				const episode = Number(data.episode ?? 0);
				if (season > 0 && episode > 0)
					this.handlers.onNextEpisode(season, episode);
				break;
			}
			case "cinesrc:error":
				this.handlers.onError(
					typeof data.error === "string" ? data.error : "Playback error",
				);
				break;
			default:
				break;
		}
	}
}
