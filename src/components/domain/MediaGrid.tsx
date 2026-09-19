import { MediaCard } from "@/components/domain/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/lib/types";

interface MediaGridProps {
	items: MediaItem[];
	loading: boolean;
	skeletonCount?: number;
}

export function MediaGrid({
	items,
	loading,
	skeletonCount = 12,
}: MediaGridProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
				{Array.from({ length: skeletonCount }, (_, i) => (
					<Skeleton key={i} className="aspect-[2/3] rounded-lg" />
				))}
			</div>
		);
	}
	return (
		<div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
			{items.map((item) => (
				<div key={`${item.mediaType}-${item.id}`} className="[&>div]:w-full">
					<MediaCard item={item} />
				</div>
			))}
		</div>
	);
}
