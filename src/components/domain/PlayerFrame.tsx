import { TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlayerController } from "@/services/player";

interface PlayerFrameProps {
	src: string;
	title: string;
	onTime(time: number, duration: number): void;
	onEnded(): void;
	onNextEpisode(season: number, episode: number): void;
}

export function PlayerFrame({
	src,
	title,
	onTime,
	onEnded,
	onNextEpisode,
}: PlayerFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [started, setStarted] = useState(false);
	const [failed, setFailed] = useState(false);
	const handlersRef = useRef({
		onTime,
		onEnded,
		onNextEpisode,
		onError: () => setFailed(true),
	});
	handlersRef.current = {
		onTime,
		onEnded,
		onNextEpisode,
		onError: () => setFailed(true),
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset facade whenever the episode URL changes
	useEffect(() => {
		setStarted(false);
		setFailed(false);
	}, [src]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-attach only on play-state/URL change; handlers flow via ref
	useEffect(() => {
		if (!started || !iframeRef.current) return;
		const controller = new PlayerController({
			onTime: (t, d) => handlersRef.current.onTime(t, d),
			onEnded: () => handlersRef.current.onEnded(),
			onNextEpisode: (s, e) => handlersRef.current.onNextEpisode(s, e),
			onError: () => handlersRef.current.onError(),
		});
		const iframe = iframeRef.current;
		controller.attach(iframe);
		return () => controller.detach();
	}, [started, src]);

	return (
		<div className="overflow-hidden rounded-xl bg-black">
			<div className="relative aspect-video w-full">
				{!started ? (
					<button
						type="button"
						onClick={() => setStarted(true)}
						className="group absolute inset-0 flex w-full flex-col items-center justify-center gap-3 bg-surface"
						aria-label={`Play ${title}`}
					>
						<span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-3xl font-black text-black shadow-[0_0_32px_rgba(240,180,41,0.5)] transition-transform group-hover:scale-105">
							▶
						</span>
						<span className="text-sm text-zinc-300">Play {title}</span>
					</button>
				) : failed ? (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
						<TriangleAlert className="h-10 w-10 text-gold" aria-hidden />
						<p className="font-semibold">This stream failed to load</p>
						<p className="max-w-sm text-sm text-muted">
							The source may be down. Try another episode, or go back and try
							again later.
						</p>
						<div className="flex gap-2">
							<Button onClick={() => setFailed(false)}>Retry</Button>
							<Button variant="outline" onClick={() => setStarted(false)}>
								Back to details
							</Button>
						</div>
					</div>
				) : (
					<iframe
						ref={iframeRef}
						src={src}
						title={title}
						className={cn("absolute inset-0 h-full w-full")}
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
					/>
				)}
			</div>
		</div>
	);
}
