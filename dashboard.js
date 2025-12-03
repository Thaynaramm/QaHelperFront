// =========================
// 1) AUTENTICAÇÃO (desativada)
// =========================
// Antigamente verificava se o usuário estava logado.
// Como não existe mais login real, deixamos desativado.
/*
const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));
if (!usuarioLogado) window.location.href = "index.html";
*/
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  });
}



// =========================
// 2) TEMA LIGHT / DARK
// =========================
// Salva o tema no navegador e alterna entre claro/escuro.
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
    aplicarTema(
      document.body.classList.contains("theme-light")
        ? "theme-dark"
        : "theme-light"
    );
  });
}



// =========================
// 3) GERADOR DE CENÁRIOS
// =========================
// Recebe a descrição do requisito e monta cenários em Gherkin.
const inputRequisito = document.getElementById("inputRequisito");
const outputCenarios = document.getElementById("outputCenarios");
const btnGerarCenarios = document.getElementById("btnGerarCenarios");
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const editorCenarios = document.getElementById("editorCenarios");

function gerarCenariosGherkin(descricao) {
  if (!descricao.trim()) return "Informe uma descrição.";
  return `Funcionalidade: ${descricao}

Cenário: Fluxo de sucesso
  Dado que o usuário acessa a funcionalidade
  Quando realiza o fluxo corretamente
  Então o sistema conclui com sucesso

Cenário: Dados inválidos
  Dado que o usuário acessa a funcionalidade
  Quando informa dados inválidos
  Então o sistema exibe mensagem de erro`;
}

if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    outputCenarios.value = gerarCenariosGherkin(inputRequisito.value);
  });
}

if (btnMoverParaEdicao) {
  btnMoverParaEdicao.addEventListener("click", () => {
    editorCenarios.innerHTML = outputCenarios.value
      .split("\n")
      .map((l) => `<div>${l}</div>`)
      .join("");
    editorCenarios.focus();
  });
}



// =========================
// 4) HISTÓRICO
// =========================
// Mostra no painel os arquivos gerados (DOCX e XLSX),
// permitindo BAIXAR e EXCLUIR.
const historicoLista = document.getElementById("historicoLista");

function adicionarAoHistorico(tipo, nomeArquivo, blob) {
  const url = URL.createObjectURL(blob);

  const item = document.createElement("div");
  item.className = "historico-item";
  item.innerHTML = `
    <div class="historico-item-header">
      <div>${nomeArquivo}</div>
      <span>${tipo}</span>
    </div>
    <button class="btn-download">Baixar</button>
    <button class="btn-delete">Excluir</button>
  `;

  historicoLista.appendChild(item);

  item.querySelector(".btn-download").onclick = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
  };

  item.querySelector(".btn-delete").onclick = () => {
    item.remove();
    URL.revokeObjectURL(url);
  };
}



// =========================
// 5) EXPORTAR DOCX
// =========================
// Gera documento .docx contendo cenários e a imagem do canvas.
const btnGerarDOCX = document.getElementById("btnGerarDOCX");
if (btnGerarDOCX) {
  btnGerarDOCX.addEventListener("click", async () => {
    if (!editorCenarios.innerText.trim()) return alert("Editor vazio.");

    const children = [ new docx.Paragraph(inputRequisito.value) ];

    editorCenarios.innerText.split("\n").forEach((l) => {
      children.push(new docx.Paragraph(l));
    });

    const doc = new docx.Document({ sections: [{ children }] });
    const blob = await docx.Packer.toBlob(doc);

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "documento-qa.docx";
    a.click();

    adicionarAoHistorico("DOCX", "documento-qa.docx", blob);
  });
}



// =========================
// 6) EXPORTAR XLSX
// =========================
// Gera planejamento padrão com ID, funcionalidade e objetivo.
const btnGerarXlsx = document.getElementById("btnGerarXlsx");
if (btnGerarXlsx) {
  btnGerarXlsx.addEventListener("click", () => {
    if (!outputCenarios.value.trim()) return alert("Nada para gerar.");

    const dados = [
      ["ID", "Funcionalidade", "Objetivo", "Tipo", "Prioridade"],
      ["CT-001", inputRequisito.value, "Fluxo de sucesso", "Funcional", "Alta"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planejamento");

    const blob = new Blob(
      [XLSX.write(wb, { bookType: "xlsx", type: "array" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "planejamento-qa.xlsx";
    a.click();

    adicionarAoHistorico("XLSX", "planejamento-qa.xlsx", blob);
  });
}



// =========================
// 7) EDITOR DE IMAGEM (canvas)
// =========================
// Permite colar print, desenhar seta, retângulo, crop,
// desfazer e copiar imagem final.
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

// Estado dos desenhos e ferramentas
let elementos = [];
let undoStack = [];
let redoStack = [];
let currentTool = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let tempElement = null;

// Ajuste inicial do tamanho
canvas.width = 900;
canvas.height = 500;

// Botões de ferramentas
document.getElementById("btnToolArrow").onclick = () => (currentTool = "arrow");
document.getElementById("btnToolRect").onclick = () => (currentTool = "rect");
document.getElementById("btnToolCrop").onclick = () => (currentTool = "crop");
document.getElementById("btnToolNewImage").onclick = () => {
  elementos = [];
  redrawCanvas();
};

// Copiar imagem final
document.getElementById("btnCopyImage").onclick = () => {
  canvas.toBlob((blob) => {
    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  });
};

// Função para redesenhar tudo
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elementos.forEach((el) => desenharElemento(el));
}

// Colar imagem via CTRL+V
window.addEventListener("paste", (e) => {
  const item = [...e.clipboardData.items].find((i) =>
    i.type.startsWith("image/")
  );
  if (!item) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    elementos = [{ tipo: "imagem", img, x: 0, y: 0, w: img.width, h: img.height }];
    redrawCanvas();
  };
  img.src = URL.createObjectURL(item.getAsFile());
});
