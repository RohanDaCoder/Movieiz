import type { MediaItem } from "@/lib/types";

export function mediaTitle(item: MediaItem): string {
	return item.title;
}

export function mediaDate(item: MediaItem): string | undefined {
	return item.date || undefined;
}

export function mediaPoster(item: MediaItem): string | null {
	return item.posterPath;
}
