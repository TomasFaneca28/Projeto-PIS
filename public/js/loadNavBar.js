document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbar");
  const response = await fetch("/html/navbar.html");
  const navbar = await response.text();
  navbarContainer.innerHTML = navbar;

  // Verificar tipo de utilizador e esconder links de admin se for normal
  try {
    const userRes = await fetch("/api/user-info");
    const userData = await userRes.json();
    
    if (userData.tipoUtilizador && userData.tipoUtilizador !== 2) {
      // Utilizador normal - esconder links de admin
      const generosLink = document.querySelector('a[href="/generos"]')?.parentElement;
      const professoesLink = document.querySelector('a[href="/professions"]')?.parentElement;
      
      if (generosLink) generosLink.style.display = 'none';
      if (professoesLink) professoesLink.style.display = 'none';
    }
  } catch (err) {
    console.log('Erro ao verificar tipo de utilizador');
  }
});