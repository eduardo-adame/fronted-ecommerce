import { AlertTriangle } from "lucide-react";

export function ErrorState({
	title = "Algo salió mal",
	message = "No pudimos cargar la información. Intenta de nuevo.",
	onRetry,
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-muted">
				<AlertTriangle className="h-7 w-7 text-error" aria-hidden="true" />
			</div>
			<h3 className="text-lg font-semibold text-ink">{title}</h3>
			<p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
			{onRetry && (
				<button
					onClick={onRetry}
					className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
				>
					Intentar de nuevo
				</button>
			)}
		</div>
	);
}
