export function GenrePills({ names }: { names: string[] }) {
	if (names.length === 0) return null;
	return (
		<div className="flex flex-wrap gap-1.5">
			{names.map((n) => (
				<span
					key={n}
					className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-zinc-300"
				>
					{n}
				</span>
			))}
		</div>
	);
}
