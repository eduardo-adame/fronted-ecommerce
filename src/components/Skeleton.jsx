export function Skeleton({ className = "", width, height, ...props }) {
	return (
		<div
			className={`animate-pulse bg-surface rounded-md ${className}`}
			style={{ width, height }}
			aria-hidden="true"
			{...props}
		/>
	);
}
