document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbar");
  const response = await fetch("/html/navbar.html");
  const navbar = await response.text();
  navbarContainer.innerHTML = navbar;
});