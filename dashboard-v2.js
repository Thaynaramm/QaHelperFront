// =========================
// QA HELPER - DASHBOARD.JS (COMPLETO)
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
// =========================

const historicoLista = document.getElementById("historicoLista");

function adicionarAoHistorico(tipo, nomeArquivo, blob) {
  if (!historicoLista) return;

  const vazio = historicoLista.querySelector(".historico-item-vazio");
  if (vazio) vazio.remove();

  const url = URL.createObjectURL(blob);

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

  // BAIXAR
  item.querySelector(".btn-download").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
  });

  // EXCLUIR
  item.querySelector(".btn-delete").addEventListener("click", () => {
    item.remove();
    URL.revokeObjectURL(url);

    if (!historicoLista.querySelector(".historico-item")) {
      historicoLista.innerHTML = `
        <div class="historico-item historico-item-vazio">
          <div class="historico-titulo">Nenhum arquivo gerado ainda</div>
          <div class="historico-meta">
            <span class="historico-data">Gere cenários ou planejamento para preencher o histórico.</span>
          </div>
        </div>`;
    }
  });
}

// =========================
// EXPORTAR DOCX (NOVO FORMATO)
// =========================

const btnGerarDOCX = document.getElementById("btnGerarDOCX");

if (btnGerarDOCX) {
  btnGerarDOCX.addEventListener("click", async () => {
    if (!editorCenarios.innerText.trim()) {
      alert("Editor vazio.");
      return;
    }

    const tituloStyle = {
      font: "Calibri",
      size: 28, // 14pt
      bold: true
    };

    const textoStyle = {
      font: "Calibri",
      size: 24 // 12pt
    };

    const children = [];

    // TÍTULO
    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: inputRequisito.value || "Documento QA",
            ...tituloStyle
          })
        ],
       spacing: { after: 300 }
      })
    );

    // CENÁRIOS
    editorCenarios.innerText.split("\n").forEach((linha) => {
      children.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: linha,
              ...textoStyle
            })
          ],
          spacing: { after: 150 }
        })
      );
    });

    // IMAGEM DO CANVAS
    if (canvas && canvas.width && canvas.height) {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const maxWidth = 600;
        const scale = Math.min(1, maxWidth / canvas.width);

        children.push(
          new docx.Paragraph({
            children: [
              new docx.ImageRun({
                data: bytes,
                transformation: {
                  width: canvas.width * scale,
                  height: canvas.height * scale,
                },
              }),
            ],
          })
        );
      } catch (e) {
        console.error("Erro ao anexar imagem:", e);
      }
    }

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
// EXPORTAR XLSX (NOVA FORMATAÇÃO)
// =========================

const btnGerarXlsx = document.getElementById("btnGerarXlsx");

if (btnGerarXlsx) {
  btnGerarXlsx.addEventListener("click", () => {
    let textoBase = editorCenarios.innerText.trim()
      ? editorCenarios.innerText
      : outputCenarios.value;

    if (!textoBase.trim()) {
      alert("Nenhum cenário encontrado.");
      return;
    }

    const dados = [
      ["Título do cenário", "Pré-condição", "Passo a passo", "Suite", "Prioridade"]
    ];

    let funcionalidadeAtual = inputRequisito.value.trim() || "Funcionalidade";
    const linhas = textoBase.split("\n");

    let tituloAtual = "";
    let contador = 1;

    linhas.forEach((linhaBruta) => {
      const linha = linhaBruta.trim();
      if (!linha) return;

      if (/^Cenário\s*:/i.test(linha)) {
        tituloAtual = linha.replace(/^Cenário\s*:\s*/i, "").trim();

        const precondicao =
          `O usuário deve estar cadastrado e ter acesso ao sistema`;

        const passo =
          `Dado que o cenário foi gerado pelo QA Helper\n${linha}`;

        const suite = funcionalidadeAtual;
        const prioridade = "Alta";

        dados.push([
          tituloAtual,
          precondicao,
          passo,
          suite,
          prioridade
        ]);

        contador++;
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);

    // -----------------------------
    // ESTILO DO CABEÇALHO
    // -----------------------------
    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F81BD" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    }

    // -----------------------------
    // ESTILO DAS LINHAS
    // -----------------------------
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) {
          cell.s = {
            alignment: { wrapText: true, vertical: "top" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      }
    }

    // LARGURA DAS COLUNAS (igual à sua foto)
    ws["!cols"] = [
      { wch: 30 }, // Título
      { wch: 45 }, // Pré-condição
      { wch: 60 }, // Passo a passo
      { wch: 20 }, // Suite
      { wch: 12 }, // Prioridade
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cenários");

    const blob = new Blob(
      [XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true })],
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




