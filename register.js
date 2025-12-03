// Elementos do DOM
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");
const erroConfirm = document.getElementById("erroConfirm");
const mensagemServidor = document.getElementById("mensagemServidor");

// Modal de alerta
const alertModal = document.getElementById("modal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// --- LÓGICA DE PERSISTÊNCIA E VALIDAÇÕES ---

// 1. FUNÇÃO AUXILIAR: Salva a lista atualizada no localStorage
function salvarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// 2. FUNÇÃO AUXILIAR: Carrega a lista de usuários
function carregarUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
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

// --- EVENTO DE CADASTRO ---
registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Limpa mensagens de erro
    erroEmail.textContent = "";
    erroSenha.textContent = "";
    erroConfirm.textContent = "";
    mensagemServidor.textContent = "";

    const email = emailInput.value.trim();
    const senha = passwordInput.value.trim();
    const confirmar = confirmInput.value.trim();
    let valido = true;
    let mensagemErro = "";

    // 1. VALIDAÇÃO DE CAMPOS
    if (!email || !validarEmail(email)) {
        erroEmail.textContent = "E-mail inválido ou vazio (apenas Gmail/Hotmail).";
        mensagemErro = "E-mail inválido ou vazio.";
        valido = false;
    }

    if (!senha || !validarSenha(senha)) {
        erroSenha.textContent = "A senha deve ter min. 6 caracteres, com letra e número.";
        if (!mensagemErro) mensagemErro = "Senha inválida.";
        valido = false;
    }

    if (senha !== confirmar) {
        erroConfirm.textContent = "As senhas não coincidem.";
        if (!mensagemErro) mensagemErro = "As senhas não coincidem.";
        valido = false;
    }

    // Se a validação básica falhou, exibe o primeiro erro no modal
    if (!valido && mensagemErro) {
        abrirModal("❌ Atenção: " + mensagemErro);
        return;
    }

    // 2. LÓGICA DE CADASTRO
    if (valido) {
        let usuarios = carregarUsuarios();
        
        // Checa se o usuário JÁ EXISTE antes de cadastrar
        const usuarioExistente = usuarios.find(u => u.email === email);

        if (usuarioExistente) {
            abrirModal("❌ Usuário já cadastrado!");
            return;
        }
        
        // Cria o novo usuário
        const novoUsuario = { 
            email: email, 
            password: senha 
        };

        // Adiciona à lista
        usuarios.push(novoUsuario);

        // Salva a lista ATUALIZADA no localStorage (SOLUÇÃO DO CONFLITO)
        salvarUsuarios(usuarios);
        
        // Feedback de sucesso e redirecionamento
        abrirModal("✅ Cadastro realizado com sucesso! Você será redirecionado para o Login.");
        
        // Redireciona para a página de login após um pequeno atraso
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500); 
    }
});