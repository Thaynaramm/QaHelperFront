// Elementos do DOM
const forgotForm = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const erroEmail = document.getElementById("erroEmail");
const mensagemServidor = document.getElementById("mensagemServidor");

// Modal de alerta
const alertModal = document.getElementById("modal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// Usuários simulados (em um ambiente real, isto viria do servidor/localStorage)
let usuariosCadastrados = JSON.parse(localStorage.getItem('usuarios')) || [];

// Validação de e-mail
function validarEmail(email) {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/;
    return regexEmail.test(email);
}

// Abrir modal (AGORA ACEITA CONTEÚDO HTML)
function abrirModal(conteudoHTML) {
    modalMessage.innerHTML = conteudoHTML; // Usamos innerHTML para renderizar o link
    alertModal.style.display = "block";
}

// Fechar modal
closeModal.addEventListener("click", () => alertModal.style.display = "none");
window.addEventListener("click", (e) => { if(e.target === alertModal) alertModal.style.display = "none"; });

// Evento submit
forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    erroEmail.textContent = "";
    mensagemServidor.textContent = "";

    const email = emailInput.value.trim();

    if(!email) {
        erroEmail.textContent = "📧 Digite seu e-mail!";
        return;
    }

    if(!validarEmail(email)) {
        erroEmail.textContent = "📧 Digite um e-mail válido (Gmail ou Hotmail)!";
        return;
    }

    // Recarrega a lista do localStorage (simulando a busca no banco)
    usuariosCadastrados = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const usuario = usuariosCadastrados.find(u => u.email === email);
    
    if(!usuario) {
        // Mensagem de erro correta para recuperação de senha
        abrirModal("❌ Usuário não cadastrado! Por favor, verifique o e-mail digitado.");
        return;
    }

    // ⬅️ PARTE PRINCIPAL: Criação do modal moderno com o link de reset
    const resetLink = `reset.html?email=${email}`;
    const modalContent = `
        <h3 style="color: #4CAF50;">✅ E-mail Verificado!</h3>
        <p>
            Por motivos de segurança, você deve clicar no link abaixo para resetar sua senha.
        </p>
        <a href="${resetLink}" style="
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #7c3aed;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
        ">
            Clique aqui para Resetar a Senha
        </a>
        <p style="font-size: 0.8em; margin-top: 10px; color: #666;">
            O link de redefinição expira em 1 hora (simulação).
        </p>
    `;

    abrirModal(modalContent);
});