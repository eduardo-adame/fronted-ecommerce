import { ShoppingBag } from 'lucide-react';

export function Footer() {
	return (
		<footer className="border-t border-border bg-surface py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<div className="flex items-center gap-2">
						<ShoppingBag className="h-5 w-5 text-primary" />
						<span className="font-display text-base font-bold text-ink">Marketplace</span>
					</div>
					<p className="text-xs text-muted">
						&copy; {new Date().getFullYear()} Marketplace. Todos los derechos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
