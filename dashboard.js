// ==============================================
// QA HELPER - DASHBOARD.JS (versão estável)
// ==============================================


// =========================
// 1) SAIR (apenas recarrega a página)
// =========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    location.reload(); // sem login, apenas recarrega
  });
}



// =========================
// 2) TEMA LIGHT/DARK
// =========================
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
// 3) GERADOR DE CENÁRIOS
// =========================
const inputRequisito = document.getElementById("inputRequisito");
const outputCenarios = document.getElementById("outputCenarios");
const btnGerarCenarios = document.getElementById("btnGerarCenarios");
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const editorCenarios = document.getElementById("editorCenarios");

function gerarCenariosGherkin(descricao) {
  if (!descricao.trim()) return "Informe uma descrição.";

  return `Funcionalidade: ${descricao.trim()}

Cenário: Fluxo de sucesso
  Dado que o usuário acessa a funcionalidade
  Quando realiza o fluxo corretamente
  Então o sistema conclui com sucesso

Cenário: Dados inválidos
  Dado que o usuário acessa a funcionalidade
  Quando informa dados inválidos
  Então o sistema exibe mensagem de erro

Cenário: Regra de negócio violada
  Dado que existe uma regra de negócio
  Quando o usuário tenta violar a regra
  Então o sistema bloqueia a ação`;
}

if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    outputCenarios.value = gerarCenariosGherkin(inputRequisito.value);
  });
}

if (btnMoverParaEdicao) {
  btnMoverParaEdicao.addEventListener("click", () => {
    const texto = outputCenarios.value;
    if (!texto.trim()) return;

    editorCenarios.innerHTML = texto
      .split("\n")
      .map((l) => (l ? `<div>${l}</div>` : "<br>"))
      .join("");

    editorCenarios.focus();
  });
}



// =========================
// 4) HISTÓRICO DE ARQUIVOS
// =========================
const historicoLista = document.getElementById("historicoLista");

function adicionarAoHistorico(tipo, nomeArquivo, blob) {
  const url = URL.createObjectURL(blob);

  const vazio = historicoLista.querySelector(".historico-item-vazio");
  if (vazio) vazio.remove();

  const item = document.createElement("div");
  item.className = "historico-item";

  item.innerHTML = `
    <div class="historico-item-header">
      <div class="historico-titulo">${nomeArquivo}</div>
      <span class="historico-tipo">${tipo}</span>
    </div>
    <div class="historico-meta">
      <span class="historico-data">Gerado em ${new Date().toLocaleString()}</span>
      <div class="historico-actions">
        <button class="btn btn-outline btn-download">Baixar</button>
        <button class="btn btn-outline btn-delete">Excluir</button>
      </div>
    </div>
  `;

  historicoLista.appendChild(item);

  // Botão baixar
  item.querySelector(".btn-download").onclick = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
  };

  // Botão excluir
  item.querySelector(".btn-delete").onclick = () => {
    URL.revokeObjectURL(url);
    item.remove();

    if (!historicoLista.querySelector(".historico-item")) {
      historicoLista.innerHTML = `
        <div class="historico-item historico-item-vazio">
          <div class="historico-titulo">Nenhum arquivo gerado ainda</div>
          <div class="historico-meta">
            <span class="historico-data">Gere cenários ou planejamento para preencher o histórico.</span>
          </div>
        </div>
      `;
    }
  };
}



// =========================
// 5) EXPORTAR DOCX
// =========================
const btnGerarDOCX = document.getElementById("btnGerarDOCX");

if (btnGerarDOCX) {
  btnGerarDOCX.addEventListener("click", async () => {
    if (!editorCenarios.innerText.trim())
      return alert("O editor está vazio.");

    const children = [
      new docx.Paragraph({
        text: inputRequisito.value || "Documento QA",
        heading: docx.HeadingLevel.TITLE,
      }),
    ];

    editorCenarios.innerText.split("\n").forEach((linha) => {
      children.push(new docx.Paragraph({ text: linha }));
    });

    const doc = new docx.Document({
      sections: [{ children }],
    });

    const blob = await docx.Packer.toBlob(doc);
    const nomeArquivo = "documento-qa.docx";

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    a.click();

    adicionarAoHistorico("DOCX", nomeArquivo, blob);
  });
}



// =========================
// 6) EXPORTAR XLSX
// =========================
const btnGerarXlsx = document.getElementById("btnGerarXlsx");

if (btnGerarXlsx) {
  btnGerarXlsx.addEventListener("click", () => {
    let textoBase =
      editorCenarios.innerText.trim() ||
      outputCenarios.value.trim();

    if (!textoBase)
      return alert("Nenhum cenário disponível.");

    const dados = [
      ["ID", "Funcionalidade", "Objetivo", "Tipo", "Prioridade"],
    ];

    let funcionalidadeAtual = inputRequisito.value.trim() || "Funcionalidade";
    let contador = 1;

    textoBase.split("\n").forEach((linha) => {
      if (linha.startsWith("Cenário")) {
        const objetivo = linha.replace("Cenário:", "").trim();
        dados.push([
          "CT-" + String(contador++).padStart(3, "0"),
          funcionalidadeAtual,
          objetivo,
          "Funcional",
          "Alta",
        ]);
      }
      if (linha.startsWith("Funcionalidade")) {
        funcionalidadeAtual = linha.split(":")[1]?.trim() || funcionalidadeAtual;
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planejamento");

    const blob = new Blob(
      [XLSX.write(wb, { bookType: "xlsx", type: "array" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );

    adicionarAoHistorico("XLSX", "planejamento-qa.xlsx", blob);

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "planejamento-qa.xlsx";
    a.click();
  });
}



// =========================
// 7) EDITOR DE IMAGEM (Canvas)
// =========================

// Canvas e contexto
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

// Ferramentas e estado
let elementos = [];
let undoStack = [];
let redoStack = [];
let currentTool = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let tempElement = null;

// Tamanho inicial
canvas.width = 900;
canvas.height = 500;

// Botões
document.getElementById("btnToolArrow").onclick = () => (currentTool = "arrow");
document.getElementById("btnToolRect").onclick = () => (currentTool = "rect");
document.getElementById("btnToolCrop").onclick = () => (currentTool = "crop");
document.getElementById("btnToolNewImage").onclick = () => {
  elementos = [];
  redrawCanvas();
};

// Copiar imagem
document.getElementById("btnCopyImage").onclick = () => {
  canvas.toBlob((blob) => {
    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  });
};

// Redesenhar canvas
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elementos.forEach((el) => desenharElemento(el));
}



// ------------------------------
// COLAR IMAGEM (CTRL+V)
// ------------------------------
window.addEventListener("paste", (e) => {
  const item = [...e.clipboardData.items].find((i) =>
    i.type.startsWith("image/")
  );
  if (!item) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    elementos = [
      { tipo: "imagem", img, x: 0, y: 0, w: img.width, h: img.height },
    ];

    redrawCanvas();
  };

  img.src = URL.createObjectURL(item.getAsFile());
});
