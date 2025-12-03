# 🧪 QA Helper  
Ferramenta gratuita e prática para analistas de testes criarem cenários, planejamentos e evidências de forma rápida — direto no navegador, sem instalar nada.

---

## ✨ Funcionalidades

### ✅ Gerador automático de cenários (Gherkin)
- Digite o requisito → gere automaticamente:
  - Cenário de sucesso  
  - Cenário de dados inválidos  
  - Cenário de regra de negócio  
- Permite edição completa antes de exportar.

### ✅ Editor de cenários (texto + imagens)
- Editor completo com suporte a texto formatado.
- Permite colar imagens editadas diretamente no editor.
- Usado para documentar testes, casos e evidências.

### ✅ Editor de imagens (canvas)
- Cole prints com **CTRL+V** ou arraste imagens.
- Ferramentas disponíveis:
  - ✂ Crop  
  - ➤ Seta  
  - ▭ Retângulo  
- Copie a imagem editada direto para o editor de cenários.

### ✅ Exportação de arquivos
- **DOCX** (cenários + imagem do canvas)
- **XLSX** (planejamento de testes com CT-001, CT-002…)
- Histórico de arquivos gerados.

### ✅ Tema claro/escuro
- Troca instantânea
- Tema salvo no navegador

---

## 🚀 Como usar

1. Acesse o dashboard (index.html ou página publicada).
2. Cole a imagem com `CTRL+V` — ela vai para o Editor de Imagens.
3. Edite (seta, retângulo, corte).
4. Clique em **Copiar imagem**.
5. No Editor de Cenários → `CTRL+V` para colar a imagem editada.
6. Gere:
   - **DOCX** com texto + imagem
   - **XLSX** com planejamento
7. Baixe e use onde quiser.

Não precisa instalar nem configurar nada.

---

## 🖥️ Tecnologias utilizadas

- **HTML5, CSS3, JavaScript**
- **docx.js** (exportação de documentos)
- **xlsx.js** (planilhas)
- **Canvas API** (edição de imagens)
- **Clipboard API** (copiar/colar imagens)
- **LocalStorage** (tema + preferências)
- Totalmente client-side (0% backend)

---

## 📦 Estrutura do projeto

