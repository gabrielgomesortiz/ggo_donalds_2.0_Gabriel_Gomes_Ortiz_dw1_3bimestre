// produto.js (novo)

// =======================
// CONFIGURAÇÃO DA API
// =======================
const API_BASE_URL = 'http://localhost:3001';
let idAtual = null;
let modo = ""; // 'incluir', 'alterar', 'excluir'

// =======================
// ELEMENTOS DO DOM
// =======================
const form = document.getElementById('produto');
const searchId = document.getElementById('searchId');

const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

const tableProduto = document.getElementById('tableProduto');
const produtoNome = document.getElementById('produtoNome');
const produtoCategoria = document.getElementById('produtoCategoria');
const produtoQtd = document.getElementById('produtoQtd');
const produtoData = document.getElementById('produtoData');
const produtoPreco = document.getElementById('produtoPreco');
const produtoImg = document.getElementById('produtoImg');

const msgBox = document.createElement('div');
msgBox.id = 'msgBox';
msgBox.style.cssText = `
    position: fixed; top: 10px; right: 10px; padding: 10px 20px;
    border-radius: 5px; background-color: #4caf50; color: #fff;
    display: none; z-index: 999;
`;
document.body.appendChild(msgBox);

// =======================
// UI Helpers
// =======================
function setInitialButtons() {
    btnBuscar.style.display = "inline-block";   // Apenas Buscar visível
    btnIncluir.style.display = "none";          // Incluir escondido
    btnAlterar.style.display = "none";          // Alterar escondido
    btnExcluir.style.display = "none";          // Excluir escondido
    btnSalvar.style.display = "none";           // Salvar escondido
    btnCancelar.style.display = "none";         // Cancelar escondido

    searchId.disabled = false;
    bloquearCampos(false);
}


function showAfterFound() {
    btnBuscar.style.display = "inline-block";
    btnIncluir.style.display = "none";
    btnAlterar.style.display = "inline-block";
    btnExcluir.style.display = "inline-block";
    btnSalvar.style.display = "none";
    btnCancelar.style.display = "inline-block";

    searchId.disabled = true;
    bloquearCampos(false);
}

function showAfterNotFound() {
    btnBuscar.style.display = "inline-block";
    btnIncluir.style.display = "inline-block";
    btnAlterar.style.display = "none";
    btnExcluir.style.display = "none";
    btnSalvar.style.display = "none";
    btnCancelar.style.display = "inline-block";

    searchId.disabled = false;
    bloquearCampos(true);
}

function showEditingButtons() {
    btnBuscar.style.display = "none";
    btnIncluir.style.display = "none";
    btnAlterar.style.display = "none";
    btnExcluir.style.display = "none";
    btnSalvar.style.display = "inline-block";
    btnCancelar.style.display = "inline-block";

    searchId.disabled = true;
    bloquearCampos(true);
}

function bloquearCampos(flag) {
    [produtoNome, produtoCategoria, produtoQtd, produtoData, produtoPreco, produtoImg].forEach(el => {
        if (el) el.disabled = !flag;
    });
}

function limparFormulario() {
    [produtoNome, produtoCategoria, produtoQtd, produtoData, produtoPreco, produtoImg].forEach(el => {
        if (!el) return;
        if (el.type === "file") el.value = "";
        else el.value = "";
    });
    setPreviewFromCaminho(null);
    idAtual = null;
    modo = "";
}

// =======================
// Mostrar mensagem
// =======================
function mostrarMensagem(msg, tipo = "sucesso") {
    msgBox.textContent = msg;
    msgBox.style.backgroundColor = tipo === 'erro' ? '#f44336' : '#4caf50';
    msgBox.style.display = 'block';
    setTimeout(() => msgBox.style.display = 'none', 3000);
}

// =======================
// Preencher formulário
// =======================
function preencherFormulario(data) {
    if (!data) return;
    produtoNome.value = data.nome || "";
    produtoCategoria.value = data.id_categoria || "";
    produtoQtd.value = data.quantidade_estoque || "";
    produtoData.value = data.data_fabricacao ? String(data.data_fabricacao).split("T")[0] : "";
    produtoPreco.value = data.preco || "";
    setPreviewFromCaminho(data.caminho_imagem || null);
    idAtual = data.id_produto;
    searchId.value = idAtual;
}

// =======================
// Preview da imagem
// =======================
function ensurePreview() {
    let preview = document.getElementById('produtoPreview');
    if (!preview) {
        preview = document.createElement('img');
        preview.id = 'produtoPreview';
        preview.style.maxWidth = '150px';
        preview.style.display = 'none';
        produtoImg.parentNode.insertBefore(preview, produtoImg.nextSibling);
    }
    return preview;
}

function setPreviewFromCaminho(caminho) {
    const preview = ensurePreview();
    if (!preview) return;
    if (!caminho) { preview.style.display = "none"; preview.src = ""; return; }
    const ts = Date.now();
    preview.src = `${API_BASE_URL}/${String(caminho).replace(/^\/+/, '')}?v=${ts}`;
    preview.style.display = "block";
}

// =======================
// Carregar categorias
// =======================
async function carregarCategorias() {
    try {
        const res = await fetch(`${API_BASE_URL}/categoria`);
        if (!res.ok) return;
        const categorias = await res.json();
        if (!produtoCategoria) return;
        produtoCategoria.innerHTML = '<option value="">Selecione a Categoria</option>';
        categorias.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_categoria;
            opt.textContent = c.nome_categoria;
            produtoCategoria.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
    }
}

// =======================
// Carregar tabela de produtos
// =======================
async function carregarTabela() {
    try {
        const res = await fetch(`${API_BASE_URL}/produto`);
        if (!res.ok) throw new Error("Erro ao carregar tabela");
        const dados = await res.json();
        if (!Array.isArray(dados) || dados.length === 0) {
            tableProduto.innerHTML = "<p>Nenhum produto encontrado</p>";
            return;
        }

        let html = "<table border='1' cellspacing='0' cellpadding='6'><tr><th>Ação</th>";
        Object.keys(dados[0]).forEach(k => html += `<th>${k}</th>`);
        html += "</tr>";

        dados.forEach(p => {
            html += `<tr data-id="${p.id_produto}"><td><button type='button'>Abrir</button></td>`;
            Object.keys(p).forEach(k => {
                if (k.toLowerCase().includes("imagem") && p[k]) {
                    html += `<td><img src='${API_BASE_URL}/${p[k]}' style='max-width:80px; max-height:60px;'></td>`;
                } else {
                    html += `<td>${p[k] || ""}</td>`;
                }
            });
            html += "</tr>";
        });
        html += "</table>";
        tableProduto.innerHTML = html;

        tableProduto.querySelectorAll("tr[data-id] button").forEach(btn => {
            btn.addEventListener("click", e => {
                const tr = e.target.closest("tr");
                searchId.value = tr.dataset.id;
                btnBuscar.click();
            });
        });

    } catch (err) {
        console.error(err);
        tableProduto.innerHTML = "<p style='color:red'>Erro ao carregar produtos</p>";
    }
}

// =======================
// Buscar
// =======================
btnBuscar.addEventListener("click", async () => {
    const id = searchId.value.trim();
    if (!id) return mostrarMensagem("Digite um ID", "erro");

    try {
        const res = await fetch(`${API_BASE_URL}/produto/${id}`);
        if (res.ok) {
            const data = await res.json();
            preencherFormulario(data);
            showAfterFound();
        } else if (res.status === 404) {
            limparFormulario();
            showAfterNotFound();
            mostrarMensagem("Produto não encontrado — você pode incluir", "erro");
        } else {
            mostrarMensagem("Erro ao buscar produto", "erro");
        }
    } catch (err) {
        console.error(err);
        mostrarMensagem("Erro na requisição de busca", "erro");
    }
});
// =======================
// BOTÃO VOLTAR
// =======================
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "../menu.html"; // coloque aqui a página que deseja voltar
    });
}

// =======================
// Incluir
// =======================
btnIncluir.addEventListener("click", () => {
    limparFormulario();
    searchId.value = "";
    modo = "incluir";
    showEditingButtons();
});

// =======================
// Alterar
// =======================
btnAlterar.addEventListener("click", () => {
    if (!idAtual) return mostrarMensagem("Busque um produto antes", "erro");
    modo = "alterar";
    showEditingButtons();
});

// =======================
// Excluir
// =======================
btnExcluir.addEventListener("click", () => {
    if (!idAtual) return mostrarMensagem("Busque um produto antes", "erro");
    modo = "excluir";
    showEditingButtons();
    bloquearCampos(false);
});

// =======================
// Salvar (incluir/alterar/excluir)
// =======================
btnSalvar.addEventListener("click", async () => {
    try {
        if (!modo) return mostrarMensagem("Nenhuma operação selecionada", "erro");

        const payload = {
            nome: produtoNome.value.trim(),
            id_categoria: produtoCategoria.value ? parseInt(produtoCategoria.value) : null,
            quantidade_estoque: produtoQtd.value ? parseInt(produtoQtd.value) : 0,
            data_fabricacao: produtoData.value || null,
            preco: produtoPreco.value ? parseFloat(produtoPreco.value) : 0
        };

        if (modo !== "excluir" && (!payload.nome || !payload.id_categoria))
            return mostrarMensagem("Nome e categoria são obrigatórios", "erro");

        // INCLUIR
        if (modo === "incluir") {
            const res = await fetch(`${API_BASE_URL}/produto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) return mostrarMensagem("Erro ao incluir produto", "erro");
            const data = await res.json();
            idAtual = data.id_produto;

            if (produtoImg.files.length > 0) {
                await uploadImagem(idAtual, produtoImg.files[0]);
            }

            mostrarMensagem("Produto incluído com sucesso!");
        }
        // ALTERAR
        else if (modo === "alterar") {
            if (!idAtual) return mostrarMensagem("ID inválido", "erro");
            const res = await fetch(`${API_BASE_URL}/produto/${idAtual}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) return mostrarMensagem("Erro ao alterar produto", "erro");

            if (produtoImg.files.length > 0) {
                await uploadImagem(idAtual, produtoImg.files[0]);
            }

            mostrarMensagem("Produto alterado com sucesso!");
        }
        // EXCLUIR
        else if (modo === "excluir") {
            if (!idAtual) return mostrarMensagem("ID inválido", "erro");
            if (!confirm("Deseja excluir este produto?")) return;
            const res = await fetch(`${API_BASE_URL}/produto/${idAtual}`, { method: "DELETE" });
            if (!res.ok) return mostrarMensagem("Erro ao excluir produto", "erro");
            mostrarMensagem("Produto excluído com sucesso!");
        }

        limparFormulario();
        setInitialButtons();
        searchId.value = "";
        await carregarTabela();

    } catch (err) {
        console.error(err);
        mostrarMensagem("Erro ao salvar", "erro");
    }
});

// =======================
// Upload imagem
// =======================
async function uploadImagem(id, file) {
    try {
        const formData = new FormData();
        formData.append("imagem", file, file.name);

        const res = await fetch(`${API_BASE_URL}/produto/${id}/imagem`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (!res.ok) return mostrarMensagem("Erro ao enviar imagem", "erro");
        setPreviewFromCaminho(data.caminho_imagem || null);
    } catch (err) {
        console.error(err);
        mostrarMensagem("Erro no upload de imagem", "erro");
    }
}

// =======================
// Cancelar
// =======================
btnCancelar.addEventListener("click", () => {
    limparFormulario();
    setInitialButtons();
});

// =======================
// Inicialização
// =======================
document.addEventListener("DOMContentLoaded", async () => {
    await carregarCategorias();
    await carregarTabela();
    setInitialButtons();

    searchId.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            btnBuscar.click();
        }
    });
});

