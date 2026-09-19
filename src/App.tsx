import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { AppHeader } from "@/components/domain/AppHeader";
import { DetailsPage } from "@/routes/DetailsPage";
import { HistoryPage } from "@/routes/HistoryPage";
import { HomePage } from "@/routes/HomePage";
import { NotFoundPage } from "@/routes/NotFoundPage";
import { SearchPage } from "@/routes/SearchPage";
import { WatchlistPage } from "@/routes/WatchlistPage";
import { WatchPage } from "@/routes/WatchPage";

function Layout() {
	return (
		<div className="min-h-screen bg-base text-zinc-100">
			<AppHeader />
			<main className="mx-auto max-w-7xl px-4 pb-16">
				<Outlet />
			</main>
		</div>
	);
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		errorElement: <NotFoundPage />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "search", element: <SearchPage /> },
			{ path: "movie/:id", element: <DetailsPage /> },
			{ path: "tv/:id", element: <DetailsPage /> },
			{ path: "watch/movie/:id", element: <WatchPage /> },
			{ path: "watch/tv/:id", element: <WatchPage /> },
			{ path: "watchlist", element: <WatchlistPage /> },
			{ path: "history", element: <HistoryPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
