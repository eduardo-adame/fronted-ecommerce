import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'marketplace_cart';

function loadCart() {
	try {
		const stored = localStorage.getItem(CART_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveCart(items) {
	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	} catch {
		// localStorage full or unavailable — silent fail
	}
}

export function CartProvider({ children }) {
	const [items, setItems] = useState(loadCart);
	const [isOpen, setIsOpen] = useState(false);
	const [justAdded, setJustAdded] = useState(false);
	const timeoutRef = useRef(null);

	useEffect(() => {
		saveCart(items);
	}, [items]);

	const addItem = useCallback((producto) => {
		setItems((prev) => {
			const existing = prev.find((item) => item.id === producto.id);
			if (existing) {
				return prev.map((item) =>
					item.id === producto.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			}
			return [
				...prev,
				{
					id: producto.id,
					nombre: producto.nombre,
					precio: producto.precio,
					imagenUrl: producto.imagenUrl,
					stock: producto.stock,
					quantity: 1,
				},
			];
		});
		setJustAdded(true);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setJustAdded(false), 600);
	}, []);

	const removeItem = useCallback((productoId) => {
		setItems((prev) => prev.filter((item) => item.id !== productoId));
	}, []);

	const updateQuantity = useCallback((productoId, quantity) => {
		if (quantity < 1) {
			setItems((prev) => prev.filter((item) => item.id !== productoId));
			return;
		}
		setItems((prev) =>
			prev.map((item) =>
				item.id === productoId ? { ...item, quantity } : item
			)
		);
	}, []);

	const clearCart = useCallback(() => {
		setItems([]);
	}, []);

	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = items.reduce((sum, item) => sum + item.precio * item.quantity, 0);

	const openDrawer = useCallback(() => setIsOpen(true), []);
	const closeDrawer = useCallback(() => setIsOpen(false), []);
	const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

	return (
		<CartContext.Provider
			value={{
				items,
				totalItems,
				subtotal,
				justAdded,
				isOpen,
				addItem,
				removeItem,
				updateQuantity,
				clearCart,
				openDrawer,
				closeDrawer,
				toggleDrawer,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error('useCart must be used within a CartProvider');
	return ctx;
}
