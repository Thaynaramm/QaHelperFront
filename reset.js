// Elementos do DOM
const resetForm = document.getElementById("resetForm");
const novaSenha = document.getElementById("novaSenha");
const repitaSenha = document.getElementById("repitaSenha");

// Modal
const alertModal = document.getElementById("modal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// ⚠️ CORREÇÃO DE CHAVE: Usando "usuarios" para sincronizar com o script.js
let usuariosCadastrados = JSON.parse(localStorage.getItem("usuarios")) || []; 

// Pega email da query string
const params = new URLSearchParams(window.location.search);
const email = params.get("email");

function validarSenha(senha) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(senha);
}

function abrirModal(mensagem) {
    modalMessage.innerHTML = mensagem; // permite links/HTML
    alertModal.style.display = "block";
}

closeModal.addEventListener("click", () => alertModal.style.display = "none");
window.addEventListener("click", (e) => { if(e.target === alertModal) alertModal.style.display = "none"; });

resetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const senha1 = novaSenha.value.trim();
    const senha2 = repitaSenha.value.trim();

    if(!senha1) return abrirModal("🔐 Digite a nova senha!");
    if(!validarSenha(senha1)) return abrirModal("🔐 A senha deve ter mínimo 6 caracteres, com letra e número.");
    if(senha1 !== senha2) return abrirModal("🔐 As senhas não coincidem!");

    const usuarioIndex = usuariosCadastrados.findIndex(u => u.email === email);
    
    // Verifica se o usuário foi encontrado (índice diferente de -1)
    if(usuarioIndex !== -1) {
        // Atualiza a senha e salva a lista inteira
        usuariosCadastrados[usuarioIndex].password = senha1;
        // ⚠️ CORREÇÃO DE CHAVE: Usando "usuarios"
        localStorage.setItem("usuarios", JSON.stringify(usuariosCadastrados));
        
        abrirModal('✅ Senha redefinida! <a href="index.html" style="color: #7c3aed; font-weight: 600;">Voltar ao login</a>');
    } else {
        // Esta mensagem é mostrada se o e-mail na URL for inválido ou não for encontrado na lista.
        abrirModal("❌ Usuário não encontrado!");
    }
});