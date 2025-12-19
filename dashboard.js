// GERADOR DE CENÁRIOS
// =========================



// 1. CLASSIFICAÇÃO DO CRITÉRIO
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
Cenário: CT$${id} – ${titulo}
Dado que o usuário informe senha inválida
Quando tentar autenticar
Então o sistema deve negar o acesso e exibir mensagem de erro
`,
    VALIDACAO: `
Cenário: CT$${id} – ${titulo}
Dado que o usuário informe campos obrigatórios vazios
Quando tentar autenticar
Então o sistema deve impedir o envio do formulário
`,
    NAO_FUNCIONAL: `
Cenário: CT${id} - ${id} – ${titulo}
Dado que o usuário informe e-mail e senha válidos
Quando solicitar o login
Então o tempo de resposta não deve ultrapassar 3 segundos
`,
    AMBIENTE: `
Cenário: CT${id} - ${id} – ${titulo}
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

  // quebra linhas → array
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

// 4. BOTÃO GERAR
if (btnGerarCenarios) {
  btnGerarCenarios.addEventListener("click", () => {
    outputCenarios.value = gerarCasosDeTeste(inputRequisito.value);
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
