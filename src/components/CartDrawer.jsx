import { useEffect, useRef, useCallback } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

function CartItem({ item, onUpdateQuantity, onRemove }) {
	return (
		<li className="flex gap-3 py-4">
			<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
				<img
					src={item.imagenUrl}
					alt={item.nombre}
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="flex flex-1 flex-col justify-between min-w-0">
				<div className="min-w-0">
					<h4 className="text-sm font-semibold text-ink truncate">{item.nombre}</h4>
					<p className="text-sm font-bold text-ink mt-0.5">
						${Number(item.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
					</p>
				</div>
				<div className="flex items-center justify-between mt-1">
					<div className="flex items-center gap-1">
						<button
							onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
							className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-ink transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
							aria-label={`Reducir cantidad de ${item.nombre}`}
						>
							<Minus className="h-3 w-3" />
						</button>
						<span className="w-8 text-center text-sm font-medium text-ink" aria-label={`${item.quantity} unidades`}>
							{item.quantity}
						</span>
						<button
							onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
							disabled={item.quantity >= item.stock}
							className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-ink transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
							aria-label={`Aumentar cantidad de ${item.nombre}`}
						>
							<Plus className="h-3 w-3" />
						</button>
					</div>
					<button
						onClick={() => onRemove(item.id)}
						className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-error-muted hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/20"
						aria-label={`Eliminar ${item.nombre} del carrito`}
					>
						<Trash2 className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
		</li>
	);
}

function CartEmpty({ onClose }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
				<ShoppingBag className="h-7 w-7 text-muted" aria-hidden="true" />
			</div>
			<h3 className="text-base font-semibold text-ink">Tu carrito está vacío</h3>
			<p className="mt-1 max-w-[240px] text-sm text-muted">
				Explora nuestro catálogo para encontrar algo que te guste.
			</p>
			<button
				onClick={onClose}
				className="mt-5 cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
			>
				Explorar productos
			</button>
		</div>
	);
}

export function CartDrawer() {
	const {
		items,
		totalItems,
		subtotal,
		isOpen,
		closeDrawer,
		updateQuantity,
		removeItem,
	} = useCart();

	const drawerRef = useRef(null);
	const closeButtonRef = useRef(null);

	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === 'Escape') {
				closeDrawer();
				return;
			}
			if (e.key === 'Tab' && drawerRef.current) {
				const focusable = drawerRef.current.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		},
		[closeDrawer]
	);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			setTimeout(() => closeButtonRef.current?.focus(), 100);
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, handleKeyDown]);

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 z-[300] bg-black/40 transition-opacity"
					onClick={closeDrawer}
					aria-hidden="true"
				/>
			)}

			<div
				ref={drawerRef}
				role="dialog"
				aria-modal="true"
				aria-label="Carrito de compras"
				className={`fixed right-0 top-0 z-[400] flex h-full w-full max-w-[380px] flex-col bg-bg shadow-lg transition-transform duration-200 ease-out ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<h2 className="text-base font-bold text-ink" aria-live="polite">
						Tu carrito
						{totalItems > 0 && (
							<span className="ml-2 text-sm font-normal text-muted">
								({totalItems} producto{totalItems !== 1 ? 's' : ''})
							</span>
						)}
					</h2>
					<button
						ref={closeButtonRef}
						onClick={closeDrawer}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
						aria-label="Cerrar carrito"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{items.length === 0 ? (
					<CartEmpty onClose={closeDrawer} />
				) : (
					<>
						<ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
							{items.map((item) => (
								<CartItem
									key={item.id}
									item={item}
									onUpdateQuantity={updateQuantity}
									onRemove={removeItem}
								/>
							))}
						</ul>

						<div className="border-t border-border px-5 py-4">
							<div className="flex items-baseline justify-between mb-4">
								<span className="text-sm font-medium text-muted">Subtotal</span>
								<span className="text-lg font-bold text-ink">
									${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
								</span>
							</div>
							<button
								className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
							>
								Proceder al pago
							</button>
							<p className="mt-2 text-center text-xs text-muted">
								Envío e impuestos se calculan al finalizar
							</p>
						</div>
					</>
				)}
			</div>
		</>
	);
}
