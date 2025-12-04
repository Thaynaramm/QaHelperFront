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
const btnLimparGerador = document.getElementById("btnLimparGerador");
const btnLimparEditor = document.getElementById("btnLimparEditor");
const btnMoverParaEdicao = document.getElementById("btnMoverParaEdicao");
const editorCenarios = document.getElementById("editorCenarios");

// =========================
// CENÁRIOS FIXOS PADRÃO
// =========================

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

// BOTÕES DO GERADOR
if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    outputCenarios.value = gerarCenariosGherkin(inputRequisito.value);
  });
}

if (btnLimparGerador) {
  btnLimparGerador.addEventListener("click", () => {
    outputCenarios.value = "";
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

if (btnLimparEditor) {
  btnLimparEditor.addEventListener("click", () => {
    editorCenarios.innerHTML = "";
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
            <span class="historico-data">Gere cenários ou planejamento para preencher o histórico.</span>
          </div>
        </div>
      `;
    }
  });
}

// =========================
// EXPORTAÇÃO DOCX
// =========================

const btnGerarDOCX = document.getElementById("btnGerarDOCX");

if (btnGerarDOCX) {
  btnGerarDOCX.addEventListener("click", async () => {
    if (!editorCenarios || !editorCenarios.innerText.trim()) {
      return alert("Editor vazio.");
    }

    const children = [
      new docx.Paragraph({
        text: inputRequisito.value || "Documento QA",
        heading: docx.HeadingLevel.TITLE,
      }),
    ];

    const linhas = editorCenarios.innerText.split("\n");
    linhas.forEach((linha) => {
      children.push(new docx.Paragraph({ text: linha }));
    });

    if (canvas && canvas.width && canvas.height) {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];

        const byteChars = atob(base64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNums);

        const maxWidth = 600;
        const scale = Math.min(1, maxWidth / canvas.width);
        const imgW = canvas.width * scale;
        const imgH = canvas.height * scale;

        const imageRun = new docx.ImageRun({
          data: byteArray,
          transformation: { width: imgW, height: imgH },
        });

        children.push(new docx.Paragraph({ children: [imageRun] }));
      } catch (e) {
        console.error("Erro ao adicionar imagem no DOCX:", e);
      }
    }

    const doc = new docx.Document({ sections: [{ children }] });

    const blob = await docx.Packer.toBlob(doc);
    const nomeArquivo = "documento-qa.docx";

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    a.click();

    adicionarAoHistorico("DOCX", nomeArquivo, blob);
  });
}
