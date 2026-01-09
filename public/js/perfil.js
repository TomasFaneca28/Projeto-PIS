// Carrega os dados do utilizador autenticado e preenche o perfil
const loadProfile = async () => {
	const username = document.getElementById('username');
	const email = document.getElementById('email');
	const userId = document.getElementById('userId');
	const reviewsCount = document.getElementById('reviews-count');
	const favoritosCount = document.getElementById('favoritos-count');

	try {
		const response = await fetch('/api/user-info');
		const data = await response.json();

		if (!response.ok || data.error) {
			alert('Erro: ' + (data.error || 'Não foi possível obter o perfil'));
			window.location.href = '/login';
			return;
		}

		if (username) username.textContent = data.username || '-';
		if (email) email.textContent = data.email || '-';
		if (userId) userId.textContent = data.userId || '-';
		if (reviewsCount) reviewsCount.textContent = data.reviewCount || 0;
		if (favoritosCount) favoritosCount.textContent = data.favoritosCount || 0;
	} catch (error) {
		console.error('Erro a carregar perfil:', error);
		alert('Erro a carregar perfil');
		window.location.href = '/login';
	}
};

document.addEventListener('DOMContentLoaded', loadProfile);