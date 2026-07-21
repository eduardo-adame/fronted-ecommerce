import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({ open, title, message, confirmLabel = "Eliminar", onConfirm, onCancel, loading }) {
	return (
		<dialog
			ref={(el) => { if (el) { open ? el.showModal() : el.close(); } }}
			onClose={onCancel}
			className="fixed inset-0 m-auto max-w-sm rounded-xl bg-bg p-6 shadow-lg backdrop:bg-black/40 backdrop:animate-fade-in open:animate-fade-in"
		>
			<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-muted">
				<AlertTriangle className="h-6 w-6 text-error" aria-hidden="true" />
			</div>
			<h3 className="text-center text-lg font-bold text-ink">{title}</h3>
			<p className="mt-1 text-center text-sm text-muted">{message}</p>
			<div className="mt-5 flex gap-3">
				<button
					onClick={onCancel}
					disabled={loading}
					className="flex-1 cursor-pointer rounded-lg bg-surface py-2 text-sm font-medium text-ink ring-1 ring-border transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Cancelar
				</button>
				<button
					onClick={onConfirm}
					disabled={loading}
					className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:bg-accent-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? (
						<>
							<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							Eliminando…
						</>
					) : (
						confirmLabel
					)}
				</button>
			</div>
		</dialog>
	);
}
