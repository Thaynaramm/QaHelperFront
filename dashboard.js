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
// GERADOR DE CENÁRIOS
// =========================
const inputRequisito = document.getElementById("inputRequisito");
const outputCenarios = document.getElementById("outputCenarios");
const btnGerarCenarios = document.getElementById("btnGerarCenarios");
const btnLimparGerados = document.getElementById("btnLimparGerados");
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const btnLimparEditor = document.getElementById("btnLimparEditor");
const editorCenarios = document.getElementById("editorCenarios");

// CENÁRIOS FIXOS
function gerarCenariosGherkin(descricao) {
  if (!descricao.trim()) return "Informe uma descrição de requisito.";

  return `
Cenário: Fluxo de sucesso
  Dado que o usuário acessa a funcionalidade
  Quando realiza o fluxo principal corretamente
  Então o sistema deve concluir a ação com sucesso

Cenário: Dados inválidos
  Dado que o usuário acessa a funcionalidade
  Quando informa dados inválidos
  Então o sistema deve exibir mensagem de erro

Cenário: Regra de negócio violada
  Dado que existe uma regra de negócio
  Quando o usuário tenta violar essa regra
  Então o sistema bloqueia a ação

Cenário: Campos obrigatórios não preenchidos
  Dado que o usuário acessa a funcionalidade
  Quando deixa campos obrigatórios vazios
  Então o sistema deve alertar sobre o preenchimento obrigatório

Cenário: Tempo de resposta excedido
  Dado que o sistema está processando uma requisição
  Quando o tempo limite é ultrapassado
  Então o sistema deve exibir mensagem de indisponibilidade

Cenário: Permissão insuficiente
  Dado que o usuário não possui permissão
  Quando tenta acessar a funcionalidade
  Então o sistema deve negar o acesso
`.trim();
}

// BOTÃO GERAR
if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    outputCenarios.value = gerarCenariosGherkin(inputRequisito.value);
  });
}

// LIMPAR CENÁRIOS
if (btnLimparGerados) {
  btnLimparGerados.addEventListener("click", () => {
    outputCenarios.value = "";
  });
}

// MOVER PARA EDIÇÃO
if (btnMoverParaEdicao) {
  btnMoverParaEdicao.addEventListener("click", () => {
    const texto = outputCenarios.value;
    if (!texto.trim()) return;

    // Filtra apenas blocos que começam com "Cenário:"
    const linhasValidas = texto
      .split("\n")
      .filter((l) => l.trim().startsWith("Cenário:") || l.trim().startsWith("Dado") || l.trim().startsWith("Quando") || l.trim().startsWith("Então"));

    // Converte de volta para HTML
    editorCenarios.innerHTML = linhasValidas
      .map((l) => `<div>${l}</div>`)
      .join("");

    editorCenarios.focus();
  });
}

// LIMPAR EDITOR DE CENÁRIOS
if (btnLimparEditor) {
  btnLimparEditor.addEventListener("click", () => {
    editorCenarios.innerHTML = "";
  });
}

// =========================
// HISTÓRICO
// =========================================================

const historicoLista = document.getElementById("historicoLista");
let historico = carregarHistoricoLocal() || [];

// =========================
// SALVAR / CARREGAR
// =========================

function salvarHistoricoLocal() {
  localStorage.setItem("qahelper_historico", JSON.stringify(historico));
}

function carregarHistoricoLocal() {
  const salvo = localStorage.getItem("qahelper_historico");
  return salvo ? JSON.parse(salvo) : [];
}

// =========================
// RENDERIZAR HISTÓRICO
// =========================

function renderizarHistorico() {
  historicoLista.innerHTML = "";

  if (historico.length === 0) {
    historicoLista.innerHTML = `
      <div class="historico-item historico-item-vazio">
        <div class="historico-titulo">Nenhum arquivo gerado ainda</div>
        <div class="historico-meta">
          <span class="historico-data">Gere cenários ou planejamento para preencher o histórico.</span>
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

    // Ações
    const btnDownload = div.querySelector(".btn-download");
    const btnDelete = div.querySelector(".btn-delete");

    btnDownload.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = item.url;
      a.download = item.nome;
      a.click();
    });

    btnDelete.addEventListener("click", () => {
      historico.splice(index, 1);
      salvarHistoricoLocal();
      renderizarHistorico();
    });

    historicoLista.appendChild(div);
  });
}

// =========================
// ADICIONAR ITEM AO HISTÓRICO
// =========================

function adicionarAoHistorico(tipo, nomeArquivo, blob) {
  const url = URL.createObjectURL(blob);

  const novoItem = {
    tipo,
    nome: nomeArquivo,
    url,
    data: new Date().toLocaleString()
  };

  historico.push(novoItem);
  salvarHistoricoLocal();
  renderizarHistorico();
}

// =========================
// CARREGAR HISTÓRICO AO INICIAR
// =========================
renderizarHistorico();


// EXPORTAR DOCX (IMAGENS INLINE NA ORDEM CORRETA)
// =========================

if (btnGerarDOCX) {
  btnGerarDOCX.addEventListener("click", async () => {

    // Obter o HTML real do editor
    const html = editorCenarios.innerHTML.trim();

    if (!html) {
      alert("O editor está vazio.");
      return;
    }

    const textoStyle = {
      font: "Calibri",
      size: 24 // 12pt
    };

    const children = [];

    // Criar um container temporário
    const container = document.createElement("div");
    container.innerHTML = html;

    // Analisa elemento por elemento, mantendo a ordem
    function processarNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const texto = node.textContent.trim();
        if (texto) {
          children.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: texto, ...textoStyle })],
              spacing: { after: 150 }
            })
          );
        }
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "BR") {
          children.push(new docx.Paragraph({ children: [] }));
          return;
        }

        // IMAGEM INLINE
        if (node.tagName === "IMG") {
          const src = node.getAttribute("src");

          if (src.startsWith("data:image")) {
            const base64 = src.split(",")[1];
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

            // DIMENSÕES EXATAS (como você pediu)
            const largura = node.width || 500; 
            const altura = node.height || 300;

            children.push(
              new docx.Paragraph({
                children: [
                  new docx.ImageRun({
                    data: bytes,
                    transformation: {
                      width: largura,
                      height: altura
                    }
                  })
                ],
                spacing: { after: 300 }
              })
            );
          }
          return;
        }

        // DIV ou outros containers → processar conteúdo interno
        node.childNodes.forEach(processarNode);
      }
    }

    // Inicia o parser
    container.childNodes.forEach(processarNode);

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
// EXPORTAR XLSX 
// =========================
btnGerarXlsx.addEventListener("click", () => {

  let textoBruto = editorCenarios.innerText.trim()
    ? editorCenarios.innerText
    : outputCenarios.value;

  if (!textoBruto.trim()) {
    alert("Nenhum cenário encontrado.");
    return;
  }

  // -----------------------------------------
  // CADA CENÁRIO = 1 LINHA
  // -----------------------------------------

  let blocosDeCenario = textoBruto
    .split(/(?=Cenário:)/g)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  let passos = [];
  let passoNumero = 1;

  blocosDeCenario.forEach(cenarioCompleto => {

    let descricaoUnica = cenarioCompleto.replace(/\n/g, "\n");

    passos.push([
      passoNumero.toString(),       // Passo
      "https://sua-url.com",        // URL só aqui
      descricaoUnica,               // CENÁRIO INTEIRO EM UMA ÚNICA CÉLULA
      "Resultado esperado automático",
      "OK",
      "Analista QA"
    ]);

    passoNumero++;
  });

  // -----------------------------------------
  // 2) MATRIZ PRINCIPAL
  // -----------------------------------------
  const linhas = [
    ["", "Roteiro de Teste HML", "", "", "", ""],
    ["História:", "1900422", "Quantidade de Steps:", passos.length, "", ""],
    ["Cenário de teste:", "Execução de múltiplos cenários", "Status:", "Concluído", "", ""],
    ["Pré Requisito:", "N/A", "", "", "", ""],
    ["Data Execução:", new Date().toLocaleDateString(), "", "", "", ""],
    [""],
    ["Passo", "Caminho da ação", "Descrição dos Passos", "Resultado Esperado", "Resultado", "Responsável"],
    ...passos,
    [""],
    ["", "Evidências", "", "", "", ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(linhas);

  // -----------------------------------------
  // 3) MERGES
  // -----------------------------------------

  const linhaEvidencias = 7 + passos.length + 1;

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, 
    { s: { r: linhaEvidencias, c: 0 }, e: { r: linhaEvidencias, c: 5 } }
  ];

  // -----------------------------------------
  // 4) ESTILOS
  // -----------------------------------------

  const azul = "4F81BD";
  const azulClaro = "DBE5F1";
  const amarelo = "FFF2CC";

  const estiloTitulo = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
    fill: { fgColor: { rgb: azul } },
    alignment: { horizontal: "center", vertical: "center" }
  };

  const estiloInfo = {
    font: { bold: true },
    fill: { fgColor: { rgb: azulClaro } },
    alignment: { vertical: "center" }
  };

  const estiloCabecalhoAmarelo = {
    font: { bold: true },
    fill: { fgColor: { rgb: amarelo } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true }
  };

  const estiloCorpo = {
    alignment: { wrapText: true, vertical: "top" }
  };

  function aplicarEstilo(celula, estilo) {
    if (!ws[celula]) return;
    ws[celula].s = { ...ws[celula].s, ...estilo };
  }

  // Título
  aplicarEstilo("A1", estiloTitulo);

  // Evidências
  aplicarEstilo("A" + (linhaEvidencias + 1), estiloTitulo);

  // Linhas 2–5 → azul claro
  for (let r = 1; r <= 4; r++) {
    for (let c = 0; c <= 5; c++) {
      aplicarEstilo(XLSX.utils.encode_cell({ r, c }), estiloInfo);
    }
  }

  // Linha 7 → cabeçalho amarelo
  for (let c = 0; c <= 5; c++) {
    aplicarEstilo(XLSX.utils.encode_cell({ r: 6, c }), estiloCabecalhoAmarelo);
  }

  // Corpo (as linhas dos passos)
  let corpoInicio = 7;
  let corpoFim = 7 + passos.length - 1;

  for (let r = corpoInicio; r <= corpoFim; r++) {
    for (let c = 0; c <= 5; c++) {
      aplicarEstilo(XLSX.utils.encode_cell({ r, c }), estiloCorpo);
    }
  }


  // -----------------------------------------
  // 5) BORDAS EM TODA A PLANILHA
  // -----------------------------------------

  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {

      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) continue;

      if (!ws[addr].s) ws[addr].s = {};

      ws[addr].s.border = {
        top:    { style: "thin" },
        bottom: { style: "thin" },
        left:   { style: "thin" },
        right:  { style: "thin" }
      };
    }
  }


  // -----------------------------------------
  // 6) LARGURA DAS COLUNAS
  // -----------------------------------------

  ws["!cols"] = [
    { wch: 12 }, // Passo
    { wch: 40 }, // Caminho
    { wch: 100 }, // Descrição (bem larga)
    { wch: 35 }, 
    { wch: 10 }, 
    { wch: 25 }
  ];


  // -----------------------------------------
  // 7) GERAR ARQUIVO
  // -----------------------------------------

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Planejamento");

  XLSX.writeFile(wb, "planejamento_estilizado.xlsx");
});


// =========================
// EDITOR DE IMAGEM COMPLETO
// =========================

const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
let elementos = [];
let undoStack = [];
let redoStack = [];
let isPastingFromCanvas = false;
let currentTool = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let tempElement = null;

if (!canvas.width) canvas.width = 900;
if (!canvas.height) canvas.height = 500;

// fallback roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// desenha elemento
function desenharElemento(el) {
  if (el.tipo === "imagem") {
    ctx.drawImage(el.img, el.x, el.y, el.w, el.h);
    return;
  }

  if (el.tipo === "seta") {
    ctx.setLineDash([]);
    ctx.strokeStyle = el.color || "red";
    ctx.lineWidth = el.lineWidth || 3;
    ctx.beginPath();
    ctx.moveTo(el.x1, el.y1);
    ctx.lineTo(el.x2, el.y2);
    ctx.stroke();

    const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1);
    const size = 8;

    ctx.beginPath();
    ctx.moveTo(el.x2, el.y2);
    ctx.lineTo(
      el.x2 - size * Math.cos(angle - Math.PI / 6),
      el.y2 - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      el.x2 - size * Math.cos(angle + Math.PI / 6),
      el.y2 - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (el.tipo === "retangulo") {
    ctx.setLineDash([]);
    ctx.strokeStyle = el.color || "blue";
    ctx.lineWidth = el.lineWidth || 2;
    ctx.strokeRect(el.x, el.y, el.w, el.h);
    return;
  }

  if (el.tipo === "crop") {
    ctx.strokeStyle = "#00aa00";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(el.x, el.y, el.w, el.h);
    ctx.setLineDash([]);
    return;
  }
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elementos.forEach(desenharElemento);
}

function salvarUndo() {
  undoStack.push(elementos.map((el) => ({ ...el })));
  redoStack = [];
}

// tools
const btnArrow = document.getElementById("btnToolArrow");
const btnRect = document.getElementById("btnToolRect");
const btnCrop = document.getElementById("btnToolCrop");
const btnUndo = document.getElementById("btnToolUndo");
const btnRedo = document.getElementById("btnToolRedo");
const btnNewImage = document.getElementById("btnToolNewImage");
const btnCopyImage = document.getElementById("btnCopyImage");

btnArrow.onclick = () => (currentTool = "arrow");
btnRect.onclick = () => (currentTool = "rect");
btnCrop.onclick = () => (currentTool = "crop");

btnNewImage.onclick = () => {
  salvarUndo();
  elementos = [];
  redrawCanvas();
};

btnUndo.onclick = () => {
  if (!undoStack.length) return;
  redoStack.push(elementos.map((el) => ({ ...el })));
  elementos = undoStack.pop();
  redrawCanvas();
};

btnRedo.onclick = () => {
  if (!redoStack.length) return;
  undoStack.push(elementos.map((el) => ({ ...el })));
  elementos = redoStack.pop();
  redrawCanvas();
};

btnCopyImage.onclick = () => {
  canvas.toBlob((blob) => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([item]).then(() => {
      isPastingFromCanvas = true;
      alert("Imagem copiada! Cole no editor de cenários (CTRL+V).");
    });
  });
};
function getMousePos(canvasEl, evt) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  if (!currentTool) return;
  const pos = getMousePos(canvas, e);

  isDrawing = true;
  startX = pos.x;
  startY = pos.y;
  tempElement = null;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const pos = getMousePos(canvas, e);
  redrawCanvas();

  if (currentTool === "arrow") {
    tempElement = {
      tipo: "seta",
      x1: startX,
      y1: startY,
      x2: pos.x,
      y2: pos.y,
      color: "red",
      lineWidth: 3,
    };
  }

  if (currentTool === "rect" || currentTool === "crop") {
    tempElement = {
      tipo: currentTool === "crop" ? "crop" : "retangulo",
      x: Math.min(startX, pos.x),
      y: Math.min(startY, pos.y),
      w: Math.abs(pos.x - startX),
      h: Math.abs(pos.y - startY),
      color: currentTool === "crop" ? "#00aa00" : "blue",
      lineWidth: 2,
    };
  }

  if (tempElement) desenharElemento(tempElement);
});

canvas.addEventListener("mouseup", () => {
  if (!isDrawing) return;
  isDrawing = false;

  if (currentTool !== "crop") {
    salvarUndo();
    elementos.push(tempElement);
    tempElement = null;
    redrawCanvas();
    return;
  }

  // CROP REAL
  const cropRect = tempElement;

  const imgEl = elementos.find((el) => el.tipo === "imagem");
  if (!imgEl) return;

  const interX = Math.max(cropRect.x, imgEl.x);
  const interY = Math.max(cropRect.y, imgEl.y);
  const interW = Math.min(cropRect.x + cropRect.w, imgEl.x + imgEl.w) - interX;
  const interH = Math.min(cropRect.y + cropRect.h, imgEl.y + imgEl.h) - interY;

  if (interW <= 0 || interH <= 0) return;

  const scaleX = imgEl.img.width / imgEl.w;
  const scaleY = imgEl.img.height / imgEl.h;

  const srcX = (interX - imgEl.x) * scaleX;
  const srcY = (interY - imgEl.y) * scaleY;
  const srcW = interW * scaleX;
  const srcH = interH * scaleY;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = interW;
  tempCanvas.height = interH;
  const tctx = tempCanvas.getContext("2d");
  tctx.drawImage(imgEl.img, srcX, srcY, srcW, srcH, 0, 0, interW, interH);

  const newImg = new Image();
  newImg.onload = () => {
    salvarUndo();
    canvas.width = interW;
    canvas.height = interH;

    elementos = [
      { tipo: "imagem", img: newImg, x: 0, y: 0, w: interW, h: interH },
    ];

    redrawCanvas();
  };

  newImg.src = tempCanvas.toDataURL();
});

canvas.addEventListener("mouseleave", () => {
  if (isDrawing) {
    isDrawing = false;
    tempElement = null;
    redrawCanvas();
  }
});

// CTRL+V --- COLAR IMAGEM
window.addEventListener("paste", (e) => {
  const items = e.clipboardData.items;
  const imgItem = [...items].find((i) => i.type.startsWith("image/"));
  if (!imgItem) return;

  // evita colar canvas dentro do editor quando veio do botão "copiar imagem"
  if (editorCenarios.contains(document.activeElement) && isPastingFromCanvas) {
    isPastingFromCanvas = false;
    return;
  }

  e.preventDefault();

  const file = imgItem.getAsFile();
  const img = new Image();

  img.onload = () => {
    salvarUndo();

    canvas.width = img.width;
    canvas.height = img.height;

    elementos = [
      { tipo: "imagem", img, x: 0, y: 0, w: img.width, h: img.height },
    ];

    redrawCanvas();
  };

  img.src = URL.createObjectURL(file);
});






















