// =========================
// QA HELPER - DASHBOARD
// =========================

// =========================
// TEMA LIGHT / DARK
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
function classificarCriterio(criterio) {
  const texto = criterio.toLowerCase();

  if (texto.includes("sucesso") || texto.includes("permitir")) return "SUCESSO";
  if (texto.includes("inválida") || texto.includes("negar")) return "ERRO_NEGOCIO";
  if (texto.includes("vazios") || texto.includes("obrigatórios")) return "VALIDACAO";
  if (texto.includes("tempo de resposta") || texto.includes("segundos")) return "NAO_FUNCIONAL";
  if (texto.includes("ambiente") || texto.includes("disponível")) return "AMBIENTE";

  return null;
}

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

function gerarCasosDeTeste(textoBruto) {
  if (!textoBruto.trim()) return "";

  const linhas = textoBruto
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let id = 1;
  const saida = [];

  linhas.forEach(linha => {
    const tipo = classificarCriterio(linha);
    if (!tipo) return;

    saida.push(gerarCenario(tipo, linha, id));
    id++;
  });

  return saida.join("\n\n");
}

// =========================
// ELEMENTOS DOM
// =========================
const inputRequisito = document.getElementById("inputRequisito");
const outputCenarios = document.getElementById("outputCenarios");
const editorCenarios = document.getElementById("editorCenarios");

const btnGerarCenarios = document.getElementById("btnGerarCenarios");
const btnLimparGerados = document.getElementById("btnLimparGerados");
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const btnLimparEditor = document.getElementById("btnLimparEditor");
const btnGerarXlsx = document.getElementById("btnGerarXlsx");
const btnGerarDocx = document.getElementById("btnGerarDocx");

// =========================
// BOTÕES – CENÁRIOS
// =========================
if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    const resultado = gerarCasosDeTeste(inputRequisito.value);
    outputCenarios.value = resultado;

    if (!resultado) {
      alert("Nenhum cenário identificado. Use critérios como sucesso, inválida, tempo de resposta.");
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
    if (!outputCenarios.value.trim()) return;

    editorCenarios.innerHTML = outputCenarios.value
      .split("\n")
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
// HISTÓRICO
// =========================
const historicoLista = document.getElementById("historicoLista");
let historico = JSON.parse(localStorage.getItem("qahelper_historico")) || [];

function salvarHistorico() {
  localStorage.setItem("qahelper_historico", JSON.stringify(historico));
}

function renderizarHistorico() {
  historicoLista.innerHTML = "";

  if (!historico.length) {
    historicoLista.innerHTML = `
      <div class="historico-item historico-item-vazio">
        <div class="historico-titulo">Nenhum arquivo gerado ainda</div>
      </div>`;
    return;
  }

  historico.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "historico-item";
    div.innerHTML = `
      <div class="historico-titulo">${item.nome}</div>
      <button class="btn btn-outline">Baixar</button>
    `;

    div.querySelector("button").onclick = () => {
      const a = document.createElement("a");
      a.href = item.base64;
      a.download = item.nome;
      a.click();
    };

    historicoLista.appendChild(div);
  });
}

function adicionarAoHistorico(nome, blob) {
  const reader = new FileReader();
  reader.onload = () => {
    historico.push({
      nome,
      base64: reader.result
    });
    salvarHistorico();
    renderizarHistorico();
  };
  reader.readAsDataURL(blob);
}

renderizarHistorico();

// =========================
// =========================
// EXPORTAR XLSX
// =========================
btnGerarXlsx.addEventListener("click", () => {

  // Captura o texto do editor
  let textoBruto = editorCenarios.innerText.trim()
    ? editorCenarios.innerText
    : outputCenarios.value;

  if (!textoBruto.trim()) {
    alert("Nenhum cenário encontrado.");
    return;
  }

  // -----------------------------------------
  // 1) SEPARAR CENÁRIOS — CADA "Cenário:" INICIA UM BLOCO
  // -----------------------------------------

  let blocosDeCenario = textoBruto
    .split(/(?=Cenário:)/g)   // divide sempre que encontra "Cenário:"
    .map(b => b.trim())
    .filter(b => b.length > 0);

  let passos = [];
  let passoNumero = 1;

  blocosDeCenario.forEach(cenarioCompleto => {

    // Todo o cenário em UMA única célula com quebras de linha
    let descricaoUnica = cenarioCompleto.replace(/\n/g, "\n");

    passos.push([
      passoNumero.toString(),       // número do passo
      "https://sua-url.com",        // URL somente na linha do passo
      descricaoUnica,               // CENÁRIO INTEIRO EM UMA CÉLULA
      "Resultado esperado automático",
      "OK",
      "Analista QA"
    ]);

    passoNumero++;
  });


  // -----------------------------------------
  // 2) MONTAR A MATRIZ COMPLETA DO XLSX
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

  // Cabeçalho amarelo (linha 7)
  for (let c = 0; c <= 5; c++) {
    aplicarEstilo(XLSX.utils.encode_cell({ r: 6, c }), estiloCabecalhoAmarelo);
  }

  // Corpo da tabela (cenários)
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
    { wch: 12 },
    { wch: 40 },
    { wch: 100 },
    { wch: 35 },
    { wch: 10 },
    { wch: 25 }
  ];


  // -----------------------------------------
  // 7) GERAR XLSX + DOWNLOAD + HISTÓRICO
  // -----------------------------------------

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Planejamento");

  // Gerar XLSX em binário
  const xlsxbinary = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

  // Converter para ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const blob = new Blob([s2ab(xlsxbinary)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  // DOWNLOAD
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "planejamento_estilizado.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // HISTÓRICO
  adicionarAoHistorico("XLSX", "planejamento_estilizado.xlsx", blob);

});

// GERAR ARQUIVO DOCX
// =========================

const btnGerarDocx = document.getElementById("btnGerarDocx");

if (btnGerarDocx) {
  btnGerarDocx.addEventListener("click", async () => {

    let children = [];

    // Percorre TODOS os nós dentro do editor
    editorCenarios.childNodes.forEach(node => {

      // ============================
      // 1. NÓ DE TEXTO / <div> / <p>
      // ============================
      if (node.nodeType === Node.ELEMENT_NODE) {

        // Se o elemento contém um <img>, tratamos separadamente
        const imgs = node.querySelectorAll("img");
        if (imgs.length > 0) {

          imgs.forEach(img => {
            const base64 = img.src.split(",")[1];
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

            children.push(
              new docx.Paragraph({
                children: [
                  new docx.ImageRun({
                    data: bytes,
                    transformation: {
                      width: 550,
                      height: 300
                    }
                  })
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { before: 200, after: 200 }
              })
            );
          });

        } else {
          // Texto comum
          const texto = node.innerText.trim();
          if (texto !== "") {
            children.push(
              new docx.Paragraph({
                text: texto,
                spacing: { before: 200, after: 200 }
              })
            );
          }
        }
      }

    });

    // ============================
    // CABEÇALHO (MANTIDO IGUAL AO SEU)
    // ============================

    const cabecalho = new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      rows: [
        new docx.TableRow({
          children: [
            new docx.TableCell({
              columnSpan: 6,
              children: [
                new docx.Paragraph({
                  text: "Roteiro de Teste - QA Helper",
                  heading: docx.HeadingLevel.HEADING_1,
                  alignment: docx.AlignmentType.CENTER
                })
              ]
            })
          ]
        }),
        new docx.TableRow({
          children: [
            new docx.TableCell({ children: [new docx.Paragraph("História:")] }),
            new docx.TableCell({ children: [new docx.Paragraph("1900422")] }),
            new docx.TableCell({ children: [new docx.Paragraph("Quantidade de Steps:")] }),
            new docx.TableCell({ children: [new docx.Paragraph("Automático")] }),
            new docx.TableCell({ children: [new docx.Paragraph("")] }),
            new docx.TableCell({ children: [new docx.Paragraph("")] })
          ]
        })
      ]
    });

    // ============================
    // MONTAGEM FINAL DO DOC
    // ============================

    const doc = new docx.Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 200, right: 800, bottom: 800, left: 800 }
            }
          },
          children: [
            cabecalho,
            new docx.Paragraph(""),
            ...children
          ]
        }
      ]
    });

    const blob = await docx.Packer.toBlob(doc);
    saveAs(blob, "cenarios_qahelper.docx");
    adicionarAoHistorico("DOCX", "cenarios_qahelper.docx", blob);

    alert("DOCX gerado com sucesso!");
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

