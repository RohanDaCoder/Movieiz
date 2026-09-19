import { useEffect, useState } from "react";

export interface AsyncState<T> {
	data: T | undefined;
	loading: boolean;
	error: string | null;
}

export function useAsync<T>(
	fn: () => Promise<T>,
	deps: unknown[],
): AsyncState<T> {
	const [data, setData] = useState<T | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		fn()
			.then((d) => {
				if (!cancelled) setData(d);
			})
			.catch((e: unknown) => {
				if (!cancelled)
					setError(e instanceof Error ? e.message : "Something went wrong");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: deps array is this hook's subscription contract
	}, deps);

	return { data, loading, error };
}
