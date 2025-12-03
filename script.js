// Elementos do DOM
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");
const erroServidor = document.getElementById("erroServidor");

// Modal de alerta
const alertModal = document.getElementById("alertModal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// FUNÇÃO AUXILIAR: Salva a lista atualizada no localStorage
function salvarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuariosCadastrados));
}

// LÓGICA DE PERSISTÊNCIA DE USUÁRIOS
let usuariosCadastrados = JSON.parse(localStorage.getItem('usuarios')) || [
    { email: "teste@gmail.com", password: "teste123" },
    { email: "usuario@hotmail.com", password: "senha123" }
];

// Garante que a lista inicial seja salva no localStorage se ainda não existir
if (!localStorage.getItem('usuarios')) {
    salvarUsuarios();
}

// Validação de e-mail (somente Gmail ou Hotmail)
function validarEmail(email) {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/;
    return regexEmail.test(email);
}

// Validação de senha (mínimo 6 caracteres, pelo menos 1 letra e 1 número)
function validarSenha(senha) {
    const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regexSenha.test(senha);
}

// Abre modal com mensagem
function abrirModal(mensagem) {
    modalMessage.textContent = mensagem;
    alertModal.style.display = "block";
}

// Fecha modal
closeModal.addEventListener("click", () => {
    alertModal.style.display = "none";
});
window.addEventListener("click", (e) => {
    if (e.target === alertModal) alertModal.style.display = "none";
});

// Evento de login
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Recarrega a lista de usuários do localStorage antes de checar o login
    usuariosCadastrados = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    erroEmail.textContent = "";
    erroSenha.textContent = "";
    erroServidor.textContent = "";

    const email = emailInput.value.trim();
    const senha = passwordInput.value.trim();

    // 1. VALIDAÇÃO DE E-MAIL (Primeiro erro a ser checado e exibido)
    if (!email) {
        abrirModal("📧 Por favor, digite seu e-mail!");
        return; // Para a execução se o campo estiver vazio
    } else if (!validarEmail(email)) {
        // ⬅️ MENSAGEM AJUSTADA: Corrigida para a que você solicitou
        abrirModal("📧 Seu email deve ser gmail ou hotmail");
        return; // Para a execução se o formato estiver incorreto
    }

    // 2. VALIDAÇÃO DE SENHA (Só será checada se o E-mail estiver correto)
    if (!senha) {
        abrirModal("🔐 Por favor, digite sua senha!");
        return; // Para a execução se o campo estiver vazio
    } else if (!validarSenha(senha)) {
        abrirModal("🔐 A senha deve ter pelo menos 6 caracteres, com letra e número.");
        return; // Para a execução se o formato estiver incorreto
    }

    // 3. LÓGICA DE LOGIN (Verificação de Credenciais Segura)
    const usuario = usuariosCadastrados.find(u => u.email === email);
    
    // ⬅️ LÓGICA CORRIGIDA E UNIFICADA: Esta é a correção de segurança
    // Se o usuário não existe OU a senha está incorreta, retorna a mesma mensagem genérica.
    if (!usuario || usuario.password !== senha) {
        abrirModal("❌ E-mail ou senha incorretos.");
        return;
    }

    // Salva usuário logado na sessionStorage
    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Redireciona para dashboard
    window.location.href = "dashboard.html";
});