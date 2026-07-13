import { useEffect } from 'react';

export function useTitle(title) {
	useEffect(() => {
		const prev = document.title;
		document.title = title ? `${title} — Marketplace` : 'Marketplace — Tienda en línea';
		return () => { document.title = prev; };
	}, [title]);
}
