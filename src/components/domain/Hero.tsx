import { Info, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatYear } from "@/lib/format";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { catalog } from "@/services/catalog";

export function Hero({ items }: { items: MediaItem[] }) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (items.length < 2) return;
		const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 8000);
		return () => clearInterval(t);
	}, [items.length]);

	const current = items[index];
	if (!current) return null;
	const watchPath =
		current.mediaType === "movie"
			? `/watch/movie/${current.id}`
			: `/watch/tv/${current.id}?s=1&e=1`;

	return (
		<section aria-label="Featured" className="relative -mx-4 overflow-hidden">
			<div className="relative h-[60vh] min-h-[420px] w-full">
				{items.map((item, i) => {
					const bg = catalog.backdrop(item.backdropPath, "original");
					if (!bg) return null;
					return (
						<img
							key={`${item.mediaType}-${item.id}`}
							src={bg}
							alt=""
							aria-hidden
							loading={i === 0 ? "eager" : "lazy"}
							className={cn(
								"absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
								i === index ? "opacity-100" : "opacity-0",
							)}
						/>
					);
				})}
				<div
					className="pointer-events-none absolute inset-0 bg-[url('/grain.svg')] opacity-20"
					aria-hidden
				/>
				<div
					className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent"
					aria-hidden
				/>
				<div className="absolute bottom-0 left-0 max-w-2xl p-6 sm:p-10">
					<p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold">
						#{index + 1} Trending{" "}
						{current.mediaType === "movie" ? "Movie" : "Show"}
					</p>
					<h1 className="font-display text-4xl font-black drop-shadow-lg sm:text-6xl">
						{current.title}
					</h1>
					<p className="mt-1 text-sm text-zinc-300">
						{formatYear(current.date)}
					</p>
					<p className="mt-3 line-clamp-3 max-w-xl text-sm text-zinc-200 sm:text-base">
						{current.overview}
					</p>
					<div className="mt-5 flex gap-3">
						<Button
							size="lg"
							className="bg-gold font-bold text-black shadow-[0_0_24px_rgba(240,180,41,0.45)] hover:bg-gold/90"
							render={<Link to={watchPath} />}
						>
							<Play className="h-5 w-5 fill-current" aria-hidden /> Play
						</Button>
						<Button
							size="lg"
							variant="secondary"
							render={<Link to={`/${current.mediaType}/${current.id}`} />}
						>
							<Info className="h-5 w-5" aria-hidden /> Details
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
