import { MediaCard } from "@/components/domain/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/lib/types";

interface MediaRowProps {
	title: string;
	items: MediaItem[];
	loading: boolean;
}

export function MediaRow({ title, items, loading }: MediaRowProps) {
	if (!loading && items.length === 0) return null;
	return (
		<section aria-label={title} className="mt-8">
			<h2 className="mb-3 font-display text-xl font-bold">{title}</h2>
			<div className="flex gap-3 overflow-x-auto pb-2">
				{loading
					? Array.from({ length: 8 }, (_, i) => (
							<Skeleton
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
								key={i}
								className="h-64 w-36 shrink-0 rounded-lg sm:w-44"
							/>
						))
					: items.map((item) => (
							<MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
						))}
			</div>
		</section>
	);
}
