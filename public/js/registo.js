 const form = document.getElementById('registoForm');
        const mensagemSucesso = document.getElementById('mensagemSucesso');
        const mensagemErro = document.getElementById('mensagemErro');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = {
                nome: document.getElementById('clientNome').value,
                email: document.getElementById('clientEmail').value,
                password: document.getElementById('clientPassword').value,
                confirmPassword: document.getElementById('clientConfirmarPassword').value
            };

            try {
                const response = await fetch('/api/registo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    mensagemErro.style.display = 'none';
                    mensagemSucesso.textContent = data.message;
                    mensagemSucesso.style.display = 'block';
                    mensagemDiv.style.display = 'block';
                    form.reset();
                    setTimeout(() => window.location.href = '/login', 1500);

                } else {
                    mensagemSucesso.style.display = 'none';
                    mensagemErro.textContent = data.error;
                    mensagemErro.style.display = 'block';
                }
            } catch (error) {
                mensagemSucesso.style.display = 'none';
                mensagemErro.textContent = data.error;
                mensagemErro.style.display = 'block';
            }
        });

        function transitionToLogin(event) {
            event.preventDefault();
            const card = document.querySelector('.card');
            card.classList.add('slide-out-right');
            window.location.href = '/login';
        }

        // Animação de entrada ao carregar a página
        window.addEventListener('load', () => {
            const card = document.querySelector('.card');
            card.classList.add('slide-in-left');
        });