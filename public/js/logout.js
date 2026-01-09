// Função para fazer logout
async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert('Logout efetuado com sucesso!');
      window.location.href = '/login';
    } else {
      const data = await response.json();
      alert('Erro ao fazer logout: ' + data.error);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao fazer logout');
  }
}
