import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Link,
	useLocation,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { ErrorState } from "@/components/domain/ErrorState";
import { PlayerFrame } from "@/components/domain/PlayerFrame";
import { SeasonEpisodePicker } from "@/components/domain/SeasonEpisodePicker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovieDetails, useSeason, useTvDetails } from "@/hooks/useCatalog";
import { useProgress } from "@/hooks/useStores";
import { PROGRESS_SAVE_INTERVAL_MS } from "@/lib/constants";
import { EmbedUrlBuilder } from "@/services/embed";

function useNumericId(): number {
	const { id } = useParams();
	const n = Number(id);
	if (!Number.isInteger(n) || n <= 0)
		throw new Error(`Invalid id in URL: ${id}`);
	return n;
}

export function WatchPage() {
	const { pathname } = useLocation();
	if (pathname.startsWith("/watch/tv/")) return <TvWatch />;
	return <MovieWatch />;
}

function MovieWatch() {
	const id = useNumericId();
	const progressApi = useProgress();
	const details = useMovieDetails(id);
	const saved = progressApi.get("movie", id);
	const lastSaved = useRef(0);

	// saved captured once on mount for resume; live progress flows through onTime
	// biome-ignore lint/correctness/useExhaustiveDependencies: resume snapshot is intentionally mount-time
	const src = useMemo(
		() =>
			EmbedUrlBuilder.movie(id, {
				back: `${window.location.origin}/movie/${id}`,
				resumeSeconds: saved?.time,
			}),
		[id],
	);

	if (details.error)
		return (
			<ErrorState
				message={details.error}
				onRetry={() => window.location.reload()}
			/>
		);

	return (
		<div className="pt-6">
			<BackLink to={`/movie/${id}`} label="Back to details" />
			<h1 className="mt-2 font-display text-2xl font-black">
				{details.data?.title ?? <Skeleton className="h-8 w-64" />}
			</h1>
			<div className="mt-4">
				<PlayerFrame
					src={src}
					title={details.data?.title ?? `Movie ${id}`}
					onTime={(time, duration) => {
						const now = Date.now();
						if (now - lastSaved.current < PROGRESS_SAVE_INTERVAL_MS) return;
						lastSaved.current = now;
						progressApi.upsert({
							mediaType: "movie",
							id,
							title: details.data?.title ?? "",
							posterPath: details.data?.posterPath ?? null,
							time,
							duration,
							updatedAt: now,
						});
					}}
					onEnded={() => progressApi.remove("movie", id)}
					onNextEpisode={() => undefined}
				/>
			</div>
		</div>
	);
}

function TvWatch() {
	const id = useNumericId();
	const [params] = useSearchParams();
	const season = Math.max(1, Number(params.get("s") ?? 1) || 1);
	const episode = Math.max(1, Number(params.get("e") ?? 1) || 1);
	const progressApi = useProgress();
	const lastSaved = useRef(0);
	const details = useTvDetails(id);
	const seasonData = useSeason(id, season);
	const saved = progressApi.get("tv", id, season, episode);

	// biome-ignore lint/correctness/useExhaustiveDependencies: resume snapshot is intentionally mount-time
	const src = useMemo(
		() =>
			EmbedUrlBuilder.episode(id, season, episode, {
				back: `${window.location.origin}/tv/${id}`,
				autonext: true,
				resumeSeconds: saved?.time,
			}),
		[id, season, episode],
	);

	const [highlight, setHighlight] = useState({ season, episode });
	useEffect(() => setHighlight({ season, episode }), [season, episode]);

	if (details.error)
		return (
			<ErrorState
				message={details.error}
				onRetry={() => window.location.reload()}
			/>
		);

	return (
		<div className="pt-6">
			<BackLink to={`/tv/${id}`} label="Back to details" />
			<h1 className="mt-2 font-display text-2xl font-black">
				{details.data?.title ?? <Skeleton className="h-8 w-64" />}
			</h1>
			<p className="text-sm text-muted">
				Season {highlight.season} · Episode {highlight.episode}
			</p>
			<div className="mt-4" key={src}>
				<PlayerFrame
					src={src}
					title={`${details.data?.title ?? "Show"} S${season} E${episode}`}
					onTime={(time, duration) => {
						const now = Date.now();
						if (now - lastSaved.current < PROGRESS_SAVE_INTERVAL_MS) return;
						lastSaved.current = now;
						progressApi.upsert({
							mediaType: "tv",
							id,
							title: details.data?.title ?? "",
							posterPath: details.data?.posterPath ?? null,
							season,
							episode,
							time,
							duration,
							updatedAt: now,
						});
					}}
					onEnded={() => progressApi.remove("tv", id, season, episode)}
					onNextEpisode={(s, e) => setHighlight({ season: s, episode: e })}
				/>
			</div>
			{details.data ? (
				<SeasonEpisodePicker
					seriesId={id}
					seriesTitle={details.data.title}
					seasons={details.data.seasons}
					activeSeason={highlight.season}
					activeEpisode={highlight.episode}
					episodes={seasonData.data?.episodes ?? []}
					episodesLoading={seasonData.loading}
				/>
			) : null}
		</div>
	);
}

function BackLink({ to, label }: { to: string; label: string }) {
	return (
		<Button variant="ghost" size="sm" render={<Link to={to} />}>
			<ArrowLeft className="h-4 w-4" aria-hidden /> {label}
		</Button>
	);
}
