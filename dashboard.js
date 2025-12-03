// =========================
// QA HELPER - DASHBOARD.JS
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
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const editorCenarios = document.getElementById("editorCenarios");

function gerarCenariosGherkin(descricao) {
  if (!descricao.trim()) return "Informe uma descrição de requisito.";
  const tituloFunc = `Funcionalidade: ${descricao.trim()}`;
  return `${tituloFunc}\n\nCenário: Fluxo de sucesso\n  Dado que o usuário acessa a funcionalidade\n  Quando ele realiza o fluxo principal corretamente\n  Então o sistema deve concluir a ação com sucesso\n\nCenário: Dados inválidos\n  Dado que o usuário acessa a funcionalidade\n  Quando ele informa dados inválidos\n  Então o sistema deve exibir mensagem de erro\n\nCenário: Regra de negócio violada\n  Dado que existe uma regra de negócio\n  Quando o usuário tenta violar a regra\n  Então o sistema bloqueia a ação`;
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
// HISTÓRICO E EXPORTAÇÃO
// =========================
const historicoLista = document.getElementById("historicoLista");
function adicionarAoHistorico(tipo, nomeArquivo, blob) {
  if (!historicoLista || !blob) return;
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

  item.querySelector(".btn-download").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
  });
  item.querySelector(".btn-delete").addEventListener("click", () => {
    URL.revokeObjectURL(url);
    item.remove();
    if (!historicoLista.querySelector(".historico-item")) {
      historicoLista.innerHTML = `
        <div class="historico-item historico-item-vazio">
          <div class="historico-titulo">Nenhum arquivo gerado ainda</div>
          <div class="historico-meta">
            <span class="historico-data">
              Gere cenários ou planejamento para preencher o histórico.
            </span>
          </div>
        </div>`;
    }
  });
}

// =========================
// EXPORTAR DOCX (texto + imagem do canvas)
// =========================
const btnGerarDOCX = document.getElementById("btnGerarDOCX");
if (btnGerarDOCX) {
  btnGerarDOCX.addEventListener("click", async () => {
    if (!editorCenarios || !editorCenarios.innerText.trim()) {
      return alert("Editor vazio.");
    }

    // 1) Parágrafo de título
    const children = [
      new docx.Paragraph({
        text: inputRequisito.value || "Documento QA",
        heading: docx.HeadingLevel.TITLE,
      }),
    ];

    // 2) Texto do editor (linha a linha)
    const linhas = editorCenarios.innerText.split("\n");
    linhas.forEach((linha) => {
      children.push(
        new docx.Paragraph({
          text: linha,
        })
      );
    });

    // 3) Se existir imagem no canvas, adiciona ao DOCX
    if (canvas && canvas.width && canvas.height) {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // define um tamanho máximo pra não ficar gigante no DOCX
        const maxWidth = 600;
        const scale = Math.min(1, maxWidth / canvas.width);
        const imgWidth = canvas.width * scale;
        const imgHeight = canvas.height * scale;

        const imageRun = new docx.ImageRun({
          data: byteArray,
          transformation: {
            width: imgWidth,
            height: imgHeight,
          },
        });

        children.push(
          new docx.Paragraph({
            children: [imageRun],
          })
        );
      } catch (e) {
        console.error("Erro ao adicionar imagem no DOCX:", e);
        // se der erro, só segue com texto
      }
    }

    // 4) Cria o documento com texto + imagem
    const doc = new docx.Document({
      sections: [
        {
          children,
        },
      ],
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
// EXPORTAR XLSX (modelo: ID Cenário, Funcionalidade, Objetivo do Teste, Tipo de Teste, Prioridade)
// =========================
const btnGerarXlsx = document.getElementById("btnGerarXlsx");
if (btnGerarXlsx) {
  btnGerarXlsx.addEventListener("click", () => {
    // 1) Descobrir de onde pegar os cenários (editor ou textarea)
    let textoBase = "";
    if (editorCenarios && editorCenarios.innerText.trim()) {
      textoBase = editorCenarios.innerText;
    } else if (outputCenarios && outputCenarios.value.trim()) {
      textoBase = outputCenarios.value;
    }

    if (!textoBase.trim()) {
      alert(
        "Nenhum cenário encontrado. Gere os cenários antes de criar o planejamento."
      );
      return;
    }

    // 2) Cabeçalho do planejamento
    const dados = [
      [
        "ID Cenário",
        "Funcionalidade",
        "Objetivo do Teste",
        "Tipo de Teste",
        "Prioridade",
      ],
    ];

    // 3) Pegar a funcionalidade atual
    let funcionalidadeAtual =
      inputRequisito && inputRequisito.value.trim()
        ? inputRequisito.value.trim()
        : "Funcionalidade";

    const linhas = textoBase.split("\n");
    let contadorCenario = 1;

    linhas.forEach((linhaBruta) => {
      const linha = linhaBruta.trim();
      if (!linha) return;

      // Atualiza funcionalidade caso encontre "Funcionalidade: X"
      if (/^Funcionalidade\s*:/i.test(linha)) {
        const partes = linha.split(":");
        if (partes[1]) funcionalidadeAtual = partes[1].trim();
        return;
      }

      // Para cada "Cenário: ..." cria uma linha no planejamento
      if (/^Cenário\s*:/i.test(linha)) {
        const objetivo = linha.replace(/^Cenário\s*:\s*/i, "").trim() || linha;

        const id = "CT-" + String(contadorCenario).padStart(3, "0");
        contadorCenario++;

        dados.push([
          id, // ID Cenário
          funcionalidadeAtual, // Funcionalidade
          objetivo, // Objetivo do Teste
          "Funcional", // Tipo de Teste (padrão)
          "Alta", // Prioridade (padrão)
        ]);
      }
    });

    if (dados.length === 1) {
      alert(
        "Não foi possível identificar cenários para gerar o planejamento."
      );
      return;
    }

    // 4) Criar planilha e workbook
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planejamento QA");

    // 5) Gerar arquivo e baixar
    const blob = new Blob(
      [XLSX.write(wb, { bookType: "xlsx", type: "array" })],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "planejamento-qa.xlsx";
    a.click();

    adicionarAoHistorico("XLSX", "planejamento-qa.xlsx", blob);
  });
}

// =========================
// EDITOR DE IMAGEM
// =========================
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
let elementos = [];
let undoStack = [];
let redoStack = [];

// estado da ferramenta e do desenho
let currentTool = null; // "arrow" | "rect" | "crop" | null
let isDrawing = false;
let startX = 0;
let startY = 0;
let tempElement = null; // elemento enquanto arrasta

// tamanho padrão do canvas
if (canvas) {
  if (!canvas.width) canvas.width = 900;
  if (!canvas.height) canvas.height = 500;
}

// fallback: função roundRect (se precisar no futuro)
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

function desenharElemento(el) {
  if (!ctx) return;
  if (el.tipo === "imagem") {
    ctx.drawImage(el.img, el.x, el.y, el.w, el.h);
  } else if (el.tipo === "seta") {
    ctx.setLineDash([]); // linha contínua
    ctx.strokeStyle = el.color || "red";
    ctx.lineWidth = el.lineWidth || 3;
    ctx.beginPath();
    ctx.moveTo(el.x1, el.y1);
    ctx.lineTo(el.x2, el.y2);
    ctx.stroke();

    // ponta da seta
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
    ctx.fillStyle = el.color || "red";
    ctx.fill();
  } else if (el.tipo === "retangulo") {
    ctx.setLineDash([]);
    ctx.strokeStyle = el.color || "blue";
    ctx.lineWidth = el.lineWidth || 2;
    ctx.strokeRect(el.x, el.y, el.w, el.h);
  } else if (el.tipo === "crop") {
    ctx.strokeStyle = el.color || "#00aa00";
    ctx.lineWidth = el.lineWidth || 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(el.x, el.y, el.w, el.h);
    ctx.setLineDash([]);
  }
}

function redrawCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elementos.forEach(desenharElemento);
}

// 🔁 salvarUndo com clone simples (mantém Image)
function salvarUndo() {
  if (!elementos || elementos.length === 0) return;
  const clone = elementos.map((el) => ({ ...el }));
  undoStack.push(clone);
  redoStack = [];
}

// BOTÕES DA TOOLBAR
const btnText = document.getElementById("btnToolText"); // será escondido
const btnArrow = document.getElementById("btnToolArrow");
const btnRect = document.getElementById("btnToolRect");
const btnCrop = document.getElementById("btnToolCrop");
const btnUndo = document.getElementById("btnToolUndo");
const btnRedo = document.getElementById("btnToolRedo");
const btnNewImage = document.getElementById("btnToolNewImage");
const btnCopyImage = document.getElementById("btnCopyImage");

// Remove/ignora botão de TEXТО
if (btnText) {
  btnText.style.display = "none";
}

// Seta: ativar ferramenta
if (btnArrow) {
  btnArrow.addEventListener("click", () => {
    currentTool = "arrow";
  });
}

// Retângulo: ativar ferramenta
if (btnRect) {
  btnRect.addEventListener("click", () => {
    currentTool = "rect";
  });
}

// Cortar: ativar crop (retângulo tracejado)
if (btnCrop) {
  btnCrop.addEventListener("click", () => {
    currentTool = "crop";
  });
}

// Nova imagem: limpa tudo (se presente)
if (btnNewImage) {
  btnNewImage.addEventListener("click", () => {
    if (!elementos.length) return;
    salvarUndo();
    elementos = [];
    redrawCanvas();
  });
}

// UNDO / REDO
if (btnUndo) {
  btnUndo.addEventListener("click", () => {
    if (!undoStack.length) return;

    // salva estado atual no redo
    const atualClone = elementos.map((el) => ({ ...el }));
    redoStack.push(atualClone);

    // recupera último do undo
    const anterior = undoStack.pop();
    elementos = anterior.map((el) => ({ ...el }));

    redrawCanvas();
  });
}

if (btnRedo) {
  btnRedo.addEventListener("click", () => {
    if (!redoStack.length) return;

    // salva estado atual no undo
    const atualClone = elementos.map((el) => ({ ...el }));
    undoStack.push(atualClone);

    // recupera último do redo
    const proximo = redoStack.pop();
    elementos = proximo.map((el) => ({ ...el }));

    redrawCanvas();
  });
}

// COPIAR IMAGEM
if (btnCopyImage) {
  btnCopyImage.addEventListener("click", () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      navigator.clipboard
        .write([new ClipboardItem({ "image/png": blob })])
        .then(() => alert("Imagem copiada!"))
        .catch(() => alert("Não foi possível copiar a imagem."));
    });
  });
}

// ----- DESENHAR COM O MOUSE -----
function getMousePos(canvasEl, evt) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener("mousedown", (e) => {
  if (!currentTool) return;

  const pos = getMousePos(canvas, e);

  if (currentTool === "arrow" || currentTool === "rect" || currentTool === "crop") {
    isDrawing = true;
    startX = pos.x;
    startY = pos.y;
    tempElement = null;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || !currentTool) return;

  const pos = getMousePos(canvas, e);
  const x = pos.x;
  const y = pos.y;

  redrawCanvas();

  if (currentTool === "arrow") {
    tempElement = {
      tipo: "seta",
      x1: startX,
      y1: startY,
      x2: x,
      y2: y,
      color: "red",
      lineWidth: 3,
    };
  } else if (currentTool === "rect" || currentTool === "crop") {
    tempElement = {
      tipo: currentTool === "crop" ? "crop" : "retangulo",
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      w: Math.abs(x - startX),
      h: Math.abs(y - startY),
      color: currentTool === "crop" ? "#00aa00" : "blue",
      lineWidth: 2,
    };
  }

  if (tempElement) desenharElemento(tempElement);
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDrawing || !currentTool) return;
  isDrawing = false;

  if (!tempElement) return;

  // Se não for crop, comportamento normal
  if (currentTool !== "crop") {
    salvarUndo();
    elementos.push(tempElement);
    tempElement = null;
    redrawCanvas();
    return;
  }

  // --------- CORTE REAL (AJUSTANDO O CANVAS AO RECORTE) ---------
  const cropRect = {
    x: tempElement.x,
    y: tempElement.y,
    w: tempElement.w,
    h: tempElement.h,
  };

  // Encontra a última imagem
  let imgIndex = -1;
  for (let i = elementos.length - 1; i >= 0; i--) {
    if (elementos[i].tipo === "imagem") {
      imgIndex = i;
      break;
    }
  }

  if (imgIndex === -1) {
    tempElement = null;
    redrawCanvas();
    return;
  }

  const imgEl = elementos[imgIndex];

  const interX = Math.max(cropRect.x, imgEl.x);
  const interY = Math.max(cropRect.y, imgEl.y);
  const interRight = Math.min(cropRect.x + cropRect.w, imgEl.x + imgEl.w);
  const interBottom = Math.min(cropRect.y + cropRect.h, imgEl.y + imgEl.h);

  const interW = interRight - interX;
  const interH = interBottom - interY;

  if (interW <= 0 || interH <= 0) {
    tempElement = null;
    redrawCanvas();
    return;
  }

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
    // salva estado antes de aplicar o novo recorte
    salvarUndo();

    // agora o canvas passa a ter o tamanho EXATO do recorte
    canvas.width = interW;
    canvas.height = interH;

    // substitui os elementos por apenas a nova imagem recortada ocupando todo o canvas
    elementos = [
      {
        tipo: "imagem",
        img: newImg,
        x: 0,
        y: 0,
        w: interW,
        h: interH,
      },
    ];

    tempElement = null;
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

// =========================
// COLAR IMAGEM (CTRL+V) – JANELA TODA
// =========================
window.addEventListener("paste", (e) => {
  const target = e.target;
  const tag = target.tagName ? target.tagName.toLowerCase() : "";
  if (
    tag === "input" ||
    tag === "textarea" ||
    target.isContentEditable
  ) {
    return;
  }

  const clipboardData = e.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  const items = clipboardData.items;
  if (!items || !items.length) return;

  let imageItem = null;
  for (const item of items) {
    if (item.type && item.type.startsWith("image/")) {
      imageItem = item;
      break;
    }
  }

  if (!imageItem) return;

  e.preventDefault();

  const file = imageItem.getAsFile();
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    // Ajusta o canvas para o tamanho da imagem (para caber inteira)
    canvas.width = img.width;
    canvas.height = img.height;

    // coloca a imagem como único elemento
    elementos = [
      {
        tipo: "imagem",
        img,
        x: 0,
        y: 0,
        w: img.width,
        h: img.height,
      },
    ];

    redrawCanvas();

    // salva esse estado como base do undo
    salvarUndo();
  };

  img.src = URL.createObjectURL(file);
});
