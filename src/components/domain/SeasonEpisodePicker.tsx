import { Link } from "react-router-dom";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatYear } from "@/lib/format";
import type { Season } from "@/lib/types";
import { cn } from "@/lib/utils";
import { catalog } from "@/services/catalog";

interface SeasonEpisodePickerProps {
	seriesId: number;
	seriesTitle: string;
	seasons: Season[];
	activeSeason: number;
	activeEpisode: number;
	episodes: {
		episodeNumber: number;
		name: string;
		overview: string;
		stillPath: string | null;
		airDate: string;
	}[];
	episodesLoading: boolean;
}

export function SeasonEpisodePicker({
	seriesId,
	seriesTitle,
	seasons,
	activeSeason,
	activeEpisode,
	episodes,
	episodesLoading,
}: SeasonEpisodePickerProps) {
	return (
		<section aria-label="Episodes" className="mt-6">
			<div className="mb-3 flex items-center gap-3">
				<h2 className="font-display text-xl font-bold">Episodes</h2>
				<Select
					value={String(activeSeason)}
					onValueChange={(v) => {
						window.location.assign(`/watch/tv/${seriesId}?s=${v}&e=1`);
					}}
				>
					<SelectTrigger aria-label="Season" className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{seasons.map((s) => (
							<SelectItem key={s.seasonNumber} value={String(s.seasonNumber)}>
								Season {s.seasonNumber}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{episodesLoading ? (
				<div className="grid gap-3 sm:grid-cols-2">
					{Array.from({ length: 4 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, order never changes
						<Skeleton key={i} className="h-24 rounded-lg" />
					))}
				</div>
			) : (
				<ol className="grid gap-3 sm:grid-cols-2">
					{episodes.map((e) => {
						const still = catalog.still(e.stillPath);
						const active = e.episodeNumber === activeEpisode;
						return (
							<li key={e.episodeNumber}>
								<Link
									to={`/watch/tv/${seriesId}?s=${activeSeason}&e=${e.episodeNumber}`}
									aria-current={active ? "true" : undefined}
									className={cn(
										"flex gap-3 rounded-lg bg-surface p-2 hover:ring-1 hover:ring-gold",
										active && "ring-1 ring-gold",
									)}
								>
									<div className="h-20 w-32 shrink-0 overflow-hidden rounded-md bg-black">
										{still ? (
											<img
												src={still}
												alt=""
												aria-hidden
												loading="lazy"
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="flex h-full items-center justify-center text-xs text-muted">
												E{e.episodeNumber}
											</span>
										)}
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold">
											{e.episodeNumber}. {e.name}
										</p>
										<p className="text-xs text-muted">
											{formatYear(e.airDate)}
										</p>
										<p className="mt-1 line-clamp-2 text-xs text-zinc-300">
											{e.overview}
										</p>
									</div>
								</Link>
							</li>
						);
					})}
				</ol>
			)}
			<p className="sr-only">{seriesTitle}</p>
		</section>
	);
}
