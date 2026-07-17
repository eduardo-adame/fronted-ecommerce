import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

function getInitialUser() {
	const token = localStorage.getItem('token');
	if (!token) return null;
	return {
		username: localStorage.getItem('username'),
		role: localStorage.getItem('rol'),
		nombre: localStorage.getItem('nombre'),
	};
}

export function UserProvider({ children }) {
	const [usuario, setUsuario] = useState(getInitialUser);

	const handleLoginSuccess = (userData) => {
		setUsuario({
			username: userData.username,
			role: userData.rol,
			nombre: userData.nombre,
		});
	};

	const handleLogOut = () => {
		setUsuario(null);
	};

	return (
		<UserContext.Provider value={{ usuario, handleLoginSuccess, handleLogOut }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error('useUser must be used within a UserProvider');
	return ctx;
}
