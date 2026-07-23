import { PackageOpen } from "lucide-react";

const icons = {
	default: PackageOpen,
};

export function EmptyState({
	icon: IconProp = "default",
	title = "No hay elementos",
	message = "No se encontraron resultados para tu búsqueda.",
	action,
}) {
	const Icon = typeof IconProp === "string" ? icons[IconProp] || icons.default : IconProp;

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
				<Icon className="h-7 w-7 text-muted" aria-hidden="true" />
			</div>
			<h3 className="text-lg font-semibold text-ink">{title}</h3>
			<p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
			{action && <div className="mt-5">{action}</div>}
		</div>
	);
}
