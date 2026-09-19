import { Ghost } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/domain/EmptyState";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
	return (
		<EmptyState
			icon={Ghost}
			title="Page not found"
			hint="The page you are looking for does not exist."
			action={<Button render={<Link to="/" />}>Go home</Button>}
		/>
	);
}
