import { useState, useEffect } from 'react';
import { Catalogo } from './components/Catalogo';
import { Registro } from './components/Registro';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProductos } from './components/AdminProductos';
import { AdminClientes } from './components/AdminClientes';
import { AdminProveedores } from './components/AdminProveedores';
import { AdminCategorias } from './components/AdminCategorias';
import { AdminVentas } from './components/AdminVentas';
import { CartDrawer } from './components/CartDrawer';
import { MiPerfil } from './components/MiPerfil';
import { MisCompras } from './components/MisCompras';
import { Checkout } from './components/Checkout';
import { Footer } from './components/Footer';
import { apiService } from './services/apiService';

function Placeholder({ title, subtitle }) {
	return (
		<div className="flex flex-col items-center justify-center py-20">
			<h2 className="text-2xl font-bold text-ink mb-2">{title}</h2>
			<p className="text-muted">{subtitle}</p>
		</div>
	);
}

function App() {
	const [vistaActual, setVistaActual] = useState('catalogo');
	const [user, setUser] = useState(null);
	const [ventaActiva, setVentaActiva] = useState(null);
	const [cart, setCart] = useState([]);
	const [isCartOpen, setIsCartOpen] = useState(false);

	useEffect(() => {
		if (apiService.isAuthenticated()) {
			setUser({
				username: localStorage.getItem('username'),
				nombre: localStorage.getItem('nombre'),
				role: localStorage.getItem('rol'),
				id: localStorage.getItem('clienteId'),
			});
		}
	}, []);

	const handleLoginSuccess = (userData) => {
		const role = userData.rol || userData.role || 'ROLE_CLIENTE';
		setUser({
			username: userData.username,
			nombre: userData.nombre,
			role,
			id: userData.clienteId,
		});
		if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
			setVistaActual('admin-dashboard');
		} else {
			setVistaActual('catalogo');
		}
	};

	const handleLogout = () => {
		apiService.logout();
		setUser(null);
		setCart([]);
		setVentaActiva(null);
		setIsCartOpen(false);
		setVistaActual('catalogo');
	};

	function handleAddToCart(producto) {
		if (!user) {
			setVistaActual('login');
			return;
		}

		if (user.role !== 'ROLE_CLIENTE') {
			alert('Solo los clientes pueden realizar compras');
			return;
		}

		setCart((prev) => {
			const existing = prev.find((item) => item.producto.id === producto.id);

			if (existing) {
				if (existing.cantidad >= producto.stock) {
					alert(`No hay más stock de ${producto.nombre}. Disponible: ${producto.stock}`);
					return prev;
				}

				return prev.map((item) =>
					item.producto.id === producto.id
						? { ...item, cantidad: item.cantidad + 1 }
						: item
				);
			}

			return [...prev, { producto, cantidad: 1 }];
		});

		setIsCartOpen(true);
	}

	function removeFromCart(productoId) {
		setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
	}

	function updateQuantity(productoId, nuevaCantidad) {
		if (nuevaCantidad <= 0) {
			removeFromCart(productoId);
			return;
		}

		setCart((prev) =>
			prev.map((item) => {
				if (item.producto.id === productoId) {
					if (nuevaCantidad > item.producto.stock) {
						alert(`No se puede exceder el stock disponible: ${item.producto.stock}`);
						return item;
					}

					return { ...item, cantidad: nuevaCantidad };
				}

				return item;
			})
		);
	}

	const vistaContenido = () => {
		switch (vistaActual) {
			case 'catalogo':
				return (
					<Catalogo setVistaActual={setVistaActual} user={user} onAddToCart={handleAddToCart} />
				);
			case 'register':
				return (
					<Registro onRegisterSuccess={() => setVistaActual('login')} onGoToLogin={() => setVistaActual('login')} />
				);
			case 'login':
				return (
					<Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setVistaActual('register')} />
				);
			case 'admin-dashboard':
				return <AdminDashboard setVistaActual={setVistaActual} />;
			case 'admin-productos':
				return <AdminProductos setVistaActual={setVistaActual} />;
			case 'admin-clientes':
				return <AdminClientes setVistaActual={setVistaActual} />;
			case 'admin-proveedores':
				return <AdminProveedores setVistaActual={setVistaActual} />;
			case 'admin-categorias':
				return <AdminCategorias setVistaActual={setVistaActual} />;
			case 'admin-ventas':
				return <AdminVentas setVistaActual={setVistaActual} />;
			case 'mi-perfil':
				return <MiPerfil setVistaActual={setVistaActual} user={user} onLogout={handleLogout} />;
			case 'mis-compras':
				return <MisCompras setVistaActual={setVistaActual} user={user} />;
			case 'checkout':
				return <Checkout setVistaActual={setVistaActual} ventaActiva={ventaActiva} />;
			default:
				return <Catalogo setVistaActual={setVistaActual} user={user} onAddToCart={handleAddToCart} />;
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-bg text-ink antialiased">
			<Navbar
				user={user}
				setVistaActual={setVistaActual}
				vistaActual={vistaActual}
				handleLogout={handleLogout}
				cart={cart}
				setIsCartOpen={setIsCartOpen}
			/>
			<main className="flex-grow pt-16 pb-12">
				{vistaContenido()}
			</main>
			<CartDrawer
				cart={cart}
				setCart={setCart}
				isOpen={isCartOpen}
				onClose={() => setIsCartOpen(false)}
				onUpdateQuantity={updateQuantity}
				onRemoveFromCart={removeFromCart}
				setIsCartOpen={setIsCartOpen}
				setVistaActual={setVistaActual}
				setVentaActiva={setVentaActiva}
			/>
			<Footer />
		</div>
	);
}

export default App;
