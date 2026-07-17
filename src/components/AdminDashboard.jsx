import { useTitle } from '../hooks/useTitle';

export function AdminDashboard() {
	useTitle("Admin Dashboard");

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="rounded-xl bg-surface p-6 ring-1 ring-border">
				<h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
			</div>
		</div>
	);
}
