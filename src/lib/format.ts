export function formatYear(date: string | undefined): string {
	if (!date) return "";
	return date.slice(0, 4);
}

export function formatRating(vote: number): string {
	if (vote <= 0) return "—";
	return (Math.round(vote * 10) / 10).toFixed(1);
}

export function formatRuntime(minutes: number | undefined | null): string {
	if (!minutes || minutes <= 0) return "";
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatEpisodes(count: number): string {
	return `${count} episode${count === 1 ? "" : "s"}`;
}
