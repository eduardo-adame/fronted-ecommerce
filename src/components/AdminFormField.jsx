export function FormField({ icon: Icon, label, name, error, children, required }) {
	return (
		<div>
			<label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
				{label}
				{required && <span className="ml-0.5 text-error">*</span>}
			</label>
			<div className="relative">
				{Icon && (
					<Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
				)}
				{children}
			</div>
			{error && <p className="mt-1 text-xs text-error">{error}</p>}
		</div>
	);
}
