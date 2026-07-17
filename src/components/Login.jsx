import { useState } from 'react';
import { Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/apiService';

export const Login = ({ onLoginSuccess, onGoToRegister }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			setError('Completa todos los campos.');
			return;
		}
		setError('');
		setLoading(true);
		try {
			const data = await apiService.login(username, password);
			onLoginSuccess(data);
		} catch (err) {
			setError(err.message || 'Credenciales inválidas. Intenta de nuevo.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[80svh] items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm animate-fade-in">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-ink">Iniciar sesión</h1>
					<p className="mt-1 text-sm text-muted">Ingresa con tu correo y contraseña</p>
				</div>

				<div className="rounded-xl bg-surface p-6 ring-1 ring-border sm:p-8">
					<form onSubmit={handleSubmit} className="space-y-5" noValidate>
						<div>
							<label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
								Correo electrónico
							</label>
							<div className="relative">
								<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
								<input
									id="login-email"
									type="email"
									value={username}
									onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
									placeholder="tu@correo.com"
									required
									disabled={loading}
									className="w-full rounded-lg border border-border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-ink">
								Contraseña
							</label>
							<div className="relative">
								<Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
								<input
									id="login-password"
									type="password"
									value={password}
									onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
									placeholder="••••••••"
									required
									disabled={loading}
									className="w-full rounded-lg border border-border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						</div>

						{error && (
							<div className="flex items-start gap-2 rounded-lg bg-error-muted p-3 text-sm text-error" role="alert">
								<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? (
								<>
									<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Ingresando…
								</>
							) : (
								<>
									<LogIn className="h-4 w-4" />
									Iniciar sesión
								</>
							)}
						</button>
					</form>
				</div>

				<p className="mt-6 text-center text-sm text-muted">
					¿No tienes una cuenta?{' '}
					<button
						onClick={onGoToRegister}
						className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline"
					>
						Regístrate
					</button>
				</p>
			</div>
		</div>
	);
};
