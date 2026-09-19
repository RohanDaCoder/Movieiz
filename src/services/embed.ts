export interface EmbedOpts {
	back?: string;
	autoplay?: boolean;
	autonext?: boolean;
	resumeSeconds?: number;
}

const BASE = "https://cinesrc.st/embed";

function applyOpts(url: URL, opts: EmbedOpts): string {
	if (opts.back) url.searchParams.set("back", opts.back);
	if (opts.autoplay === false) url.searchParams.set("autoplay", "false");
	if (opts.autonext === false) url.searchParams.set("autonext", "false");
	if (opts.resumeSeconds !== undefined && opts.resumeSeconds > 5) {
		url.searchParams.set("t", String(Math.floor(opts.resumeSeconds)));
	}
	return url.toString();
}

// biome-ignore lint/complexity/noStaticOnlyClass: brief contract requires EmbedUrlBuilder static class API
export class EmbedUrlBuilder {
	static movie(id: number, opts: EmbedOpts = {}): string {
		return applyOpts(new URL(`${BASE}/movie/${id}`), opts);
	}

	static episode(
		id: number,
		season: number,
		episode: number,
		opts: EmbedOpts = {},
	): string {
		const url = new URL(`${BASE}/tv/${id}`);
		url.searchParams.set("s", String(season));
		url.searchParams.set("e", String(episode));
		return applyOpts(url, opts);
	}
}
