// =========================
// QA HELPER
// =========================

// --------- THEME TOGGLE ---------
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeLabelSpan = document.getElementById("themeLabel");

function aplicarTema(theme) {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(theme);
  themeLabelSpan.textContent = theme === "theme-light" ? "Light" : "Dark";
  localStorage.setItem("qahelper_theme", theme);
}

const temaSalvo = localStorage.getItem("qahelper_theme") || "theme-light";
aplicarTema(temaSalvo);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const atual = document.body.classList.contains("theme-light")
      ? "theme-light"
      : "theme-dark";
    aplicarTema(atual === "theme-light" ? "theme-dark" : "theme-light");
  });
}

// =========================
// FUNÇÕES AUXILIARES
// =========================
function resumirTitulo(texto) {
  const resumo = texto
    .replace(/^como .*?, quero/i, "")
    .replace(/^como .*? quero/i, "")
    .replace(/para .*$/i, "")
    .trim()
    .substring(0, 60);

  return resumo || "Cenário automático";
}

// =========================
// GERADOR DE CENÁRIOS
// =========================

// 1. CLASSIFICAÇÃO
function classificarCriterio(criterio) {
  const texto = criterio.toLowerCase();

  if (texto.includes("sucesso") || texto.includes("permitir")) return "SUCESSO";
  if (texto.includes("inválida") || texto.includes("negar")) return "ERRO_NEGOCIO";
  if (texto.includes("vazios") || texto.includes("obrigatórios")) return "VALIDACAO";
  if (texto.includes("tempo de resposta") || texto.includes("segundos")) return "NAO_FUNCIONAL";
  if (texto.includes("disponível") || texto.includes("ambiente")) return "AMBIENTE";

  return null;
}

// 2. TEMPLATE
function gerarCenario(tipo, descricao, id) {
  const titulo = resumirTitulo(descricao);

  const map = {
    SUCESSO: `
Cenário: CT${id} – ${titulo}
Dado que o usuário informe e-mail e senha válidos
Quando solicitar o login
Então o sistema deve permitir o acesso
`,
    ERRO_NEGOCIO: `
Cenário: CT${id} – ${titulo}
Dado que o usuário informe senha inválida
Quando tentar autenticar
Então o sistema deve negar o acesso e exibir mensagem de erro
`,
    VALIDACAO: `
Cenário: CT${id} – ${titulo}
Dado que o usuário informe campos obrigatórios vazios
Quando tentar autenticar
Então o sistema deve impedir o envio do formulário
`,
    NAO_FUNCIONAL: `
Cenário: CT${id} – ${titulo}
Dado que o usuário informe e-mail e senha válidos
Quando solicitar o login
Então o tempo de resposta não deve ultrapassar 3 segundos
`,
    AMBIENTE: `
Cenário: CT${id} – ${titulo}
Dado que o usuário esteja no ambiente de homologação
Quando tentar acessar o sistema
Então o sistema deve estar disponível
`
  };

  return map[tipo]?.trim() || "";
}

// 3. FUNÇÃO PRINCIPAL
function gerarCasosDeTeste(textoBruto) {
  if (!textoBruto.trim()) return "";

  const criterios = textoBruto
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let id = 1;
  const saida = [];

  criterios.forEach(c => {
    const tipo = classificarCriterio(c);
    if (!tipo) return;

    saida.push(gerarCenario(tipo, c, id));
    id++;
  });

  return saida.join("\n\n");
}

// =========================
// ELEMENTOS DO DOM
// =========================
const btnGerarCenarios = document.getElementById("btnGerarCenarios");
const btnLimparGerados = document.getElementById("btnLimparGerados");
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const btnLimparEditor = document.getElementById("btnLimparEditor");
const btnGerarXlsx = document.getElementById("btnGerarXlsx");
const btnGerarDocx = document.getElementById("btnGerarDocx");

const inputRequisito = document.getElementById("inputRequisito");
const outputCenarios = document.getElementById("outputCenarios");
const editorCenarios = document.getElementById("editorCenarios");

// =========================
// BOTÕES – GERADOR
// =========================
if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    const resultado = gerarCasosDeTeste(inputRequisito.value);
    outputCenarios.value = resultado;

    if (!resultado) {
      alert("Nenhum cenário identificado. Use critérios claros (ex: sucesso, inválida, tempo de resposta).");
    }
  });
}

if (btnLimparGerados) {
  btnLimparGerados.addEventListener("click", () => {
    outputCenarios.value = "";
  });
}

if (btnMoverParaEdicao) {
  btnMoverParaEdicao.addEventListener("click", () => {
    const texto = outputCenarios.value;
    if (!texto.trim()) return;

    const linhasValidas = texto
      .split("\n")
      .filter(l =>
        l.trim().startsWith("Cenário:") ||
        l.trim().startsWith("Dado") ||
        l.trim().startsWith("Quando") ||
        l.trim().startsWith("Então")
      );

    editorCenarios.innerHTML = linhasValidas
      .map(l => `<div>${l}</div>`)
      .join("");

    editorCenarios.focus();
  });
}

if (btnLimparEditor) {
  btnLimparEditor.addEventListener("click", () => {
    editorCenarios.innerHTML = "";
  });
}

// =========================
// HISTÓRICO (LOCALSTORAGE)
// =========================
const historicoLista = document.getElementById("historicoLista");

function carregarHistorico() {
  const salvo = localStorage.getItem("qahelper_historico");
  return salvo ? JSON.parse(salvo) : [];
}

function salvarHistorico() {
  localStorage.setItem("qahelper_historico", JSON.stringify(historico));
}

let historico = carregarHistorico();

function renderizarHistorico() {
  historicoLista.innerHTML = "";

  if (historico.length === 0) {
    historicoLista.innerHTML = `
      <div class="historico-item historico-item-vazio">
        <div class="historico-titulo">Nenhum arquivo gerado ainda</div>
        <div class="historico-meta">
          <span class="historico-data">Gere algo para preencher o histórico.</span>
        </div>
      </div>`;
    return;
  }

  historico.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "historico-item";

    div.innerHTML = `
      <div class="historico-item-header">
        <div class="historico-titulo">${item.nome}</div>
        <span class="historico-tipo">${item.tipo}</span>
      </div>
      <div class="historico-meta">
        <span class="historico-data">Gerado em ${item.data}</span>
        <div class="historico-actions">
          <button class="btn btn-outline btn-download">Baixar</button>
          <button class="btn btn-outline btn-delete">Excluir</button>
        </div>
      </div>
    `;

    div.querySelector(".btn-download").onclick = () => {
      const a = document.createElement("a");
      a.href = item.base64;
      a.download = item.nome;
      a.click();
    };

    div.querySelector(".btn-delete").onclick = () => {
      historico.splice(index, 1);
      salvarHistorico();
      renderizarHistorico();
    };

    historicoLista.appendChild(div);
  });
}

function adicionarAoHistorico(tipo, nomeArquivo, blob) {
  const reader = new FileReader();

  reader.onload = function () {
    historico.push({
      tipo,
      nome: nomeArquivo,
      data: new Date().toLocaleString(),
      base64: reader.result
    });

    salvarHistorico();
    renderizarHistorico();
  };

  reader.readAsDataURL(blob);
}

renderizarHistorico();
