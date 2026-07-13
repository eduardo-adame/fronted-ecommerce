import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { Catalogo } from './components/Catalogo';
import Footer from './components/Footer';
import { Navbar } from './components/Navbar';
import { Registro } from './components/Registro';
import { Login } from './components/Login';
import { CartDrawer } from './components/CartDrawer';

function Placeholder({ title, subtitle }) {
	return (
		<div className="flex flex-col items-center justify-center py-20">
			<h2 className="text-2xl font-bold text-ink mb-2">{title}</h2>
			<p className="text-muted">{subtitle}</p>
		</div>
	);
}

function AppContent() {
	return (
		<div className="min-h-screen flex flex-col bg-bg text-ink antialiased">
			<Navbar />
			<main className="flex-grow pt-16 pb-12">
				<Routes>
					<Route path="/" element={<Catalogo />} />
					<Route path="/login" element={<Login />} />
					<Route path="/registro" element={<Registro />} />
					<Route path="/admin" element={<Placeholder title="Dashboard" subtitle="Panel de administración — En construcción" />} />
					<Route path="/admin/productos" element={<Placeholder title="Administrar Productos" subtitle="Gestión de productos — En construcción" />} />
					<Route path="/admin/panel" element={<Placeholder title="Panel de Administración" subtitle="Panel administrativo — En construcción" />} />
					<Route path="/mis-compras" element={<Placeholder title="Mis Compras" subtitle="Historial de compras — En construcción" />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			<Footer />
			<CartDrawer />
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<UserProvider>
				<CartProvider>
					<AppContent />
				</CartProvider>
			</UserProvider>
		</BrowserRouter>
	);
}

export default App;
