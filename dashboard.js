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
// GERAR XLSX
// =========================
if (btnGerarXlsx) {
  btnGerarXlsx.addEventListener("click", () => {
    const texto = editorCenarios.innerText || outputCenarios.value;
    if (!texto.trim()) return alert("Nenhum cenário encontrado.");

    const linhas = texto.split("\n").filter(l => l.trim());

    const ws = XLSX.utils.aoa_to_sheet([
      ["Passo", "Descrição"],
      ...linhas.map((l, i) => [i + 1, l])
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planejamento");

    const bin = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const buf = new ArrayBuffer(bin.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);

    const blob = new Blob([buf], { type: "application/octet-stream" });
    adicionarAoHistorico("planejamento.xlsx", blob);

    saveAs(blob, "planejamento.xlsx");
  });
}

// =========================
// GERAR DOCX
// =========================
if (btnGerarDocx) {
  btnGerarDocx.addEventListener("click", async () => {
    const children = [];

    editorCenarios.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.querySelector("img")) {
          node.querySelectorAll("img").forEach(img => {
            const bytes = Uint8Array.from(atob(img.src.split(",")[1]), c => c.charCodeAt(0));
            children.push(new docx.Paragraph({
              children: [new docx.ImageRun({ data: bytes, transformation: { width: 500, height: 300 } })]
            }));
          });
        } else {
          children.push(new docx.Paragraph(node.innerText));
        }
      }
    });

    const doc = new docx.Document({ sections: [{ children }] });
    const blob = await docx.Packer.toBlob(doc);

    adicionarAoHistorico("cenarios.docx", blob);
    saveAs(blob, "cenarios.docx");
  });
}

// =========================
// EDITOR DE IMAGEM
// =========================
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 500;

window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.startsWith("image/"));
  if (!item) return;

  const file = item.getAsFile();
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = URL.createObjectURL(file);
});
