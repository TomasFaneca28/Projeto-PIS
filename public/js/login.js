const form = document.getElementById('loginForm');
        const mensagemSucesso = document.getElementById('mensagemSucesso');
        const mensagemErro = document.getElementById('mensagemErro');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = {
                email: document.getElementById('clientEmail').value,
                password: document.getElementById('clientPassword').value
            };

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    mensagemErro.style.display = 'none';
                    mensagemSucesso.textContent = data.message;
                    mensagemSucesso.style.display = 'block';
                    localStorage.setItem('userId', data.userId);
                    setTimeout(() => window.location.href = '/index.html', 1500);

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

        function transitionToRegisto(event) {
            event.preventDefault();
            const card = document.querySelector('.card');
            card.classList.add('slide-out-left');
            window.location.href = '/registo';
        }

        // Adicionar animação de entrada ao carregar a página
        window.addEventListener('load', () => {
            const card = document.querySelector('.card');
            card.classList.add('slide-in-right');
        });