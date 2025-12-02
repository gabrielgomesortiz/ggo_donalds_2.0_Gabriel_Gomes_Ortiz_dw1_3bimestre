// =======================
// SCRIPT COMPLETO (CRUD multi-seção)
// =======================

/*
  Observações importantes:
  - Espera-se que o backend exponha rotas REST:
      GET  /<section>           -> lista
      GET  /<section>/:id       -> busca por id
      POST /<section>           -> criar (retorna objeto criado com id_produto ou id)
      PUT  /<section>/:id       -> atualizar (aceita JSON)
      DELETE /<section>/:id     -> excluir
    Além disso, para imagens de produto usamos um endpoint:
      POST /produto/:id/imagem  -> recebe FormData { imagem: File }
    Se seu backend aceitar multipart direto em POST /produto, o código aceita o fluxo alternativo (criamos sem imagem e enviamos depois).
*/

const API_BASE_URL = 'http://localhost:3001';
let currentId = null;
let operacao = null;

// =======================
// ELEMENTOS DO DOM
// =======================
const form = document.getElementById('edicao'); // elemento container que contém as seções (formulários)
const searchId = document.getElementById('searchId');

const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

const radios = document.querySelectorAll('input[name="section"]');
const sections = document.querySelectorAll('.section-form');

const tableFuncionario = document.getElementById('tableFuncionario');
const tablePessoa = document.getElementById('tablePessoa');
const tableProduto = document.getElementById('tableProduto');
const tableCategoria = document.getElementById('tableCategoria');
const tableCargo = document.getElementById('tableCargo');

const msgBox = document.createElement('div');
msgBox.id = 'msgBox';
msgBox.style.cssText = `
    position: fixed; top: 10px; right: 10px; padding: 10px 20px;
    border-radius: 5px; background-color: #4caf50; color: #fff;
    display: none; z-index: 999;
`;
document.body.appendChild(msgBox);

// Pegar usuário logado (se existir cookie "usuario")
const usuarioStr = getCookie("usuario");
let usuarioLogado = null;
if (usuarioStr) {
    try { usuarioLogado = JSON.parse(usuarioStr); } catch (e) { usuarioLogado = null; }
}

// =======================
// INICIALIZAÇÃO
// =======================
document.addEventListener('DOMContentLoaded', async () => {
    // ligar listeners das sections (radios)
    radios.forEach(radio => radio.addEventListener('change', async () => await setSection(radio.value)));

    // estado inicial
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);

    // se houver radio marcado, abre a seção; senão, carrega a primeira seção produto como default
    const initial = getSelectedSection() || (radios[0] && radios[0].value) || 'produto';
    await setSection(initial);

    // atalhos
    if (searchId) {
        searchId.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); buscarRegistro(); }
        });
    }

    // botão voltar (se existir)
    document.getElementById('btnVoltar')?.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
});

// proteger caso o form não exista
if (form && typeof form.addEventListener === 'function') {
    form.addEventListener('submit', e => e.preventDefault());
}

// =======================
// UI helpers
// =======================
function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

function bloquearCampos(editavel) {
    if (!form) return;
    form.querySelectorAll('input, select, textarea').forEach(input => {
        // searchId não faz parte das seções (está fora) — ignoramos
        if (input === searchId) return;
        input.disabled = !editavel;
    });
}

function limparFormulario() {
    if (!form) return;
    // limpar inputs e selects apenas dentro da seção visível
    const visibleSection = Array.from(sections).find(s => s.style.display !== 'none') || null;
    const scope = visibleSection || form;
    scope.querySelectorAll('input').forEach(i => {
        try {
            if (i.type === 'file') i.value = '';
            else if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
            else i.value = '';
        } catch (e) {}
    });
    scope.querySelectorAll('select').forEach(s => { try { s.selectedIndex = 0; } catch (e) {} });
    currentId = null;
    operacao = null;
}

function mostrarMensagem(msg, tipo = 'sucesso') {
    msgBox.textContent = msg;
    msgBox.style.backgroundColor = tipo === 'erro' ? '#f44336' : '#4caf50';
    msgBox.style.display = 'block';
    setTimeout(() => { msgBox.style.display = 'none'; }, 3000);
}

// =======================
// mudança de seção (radio)
// =======================
async function setSection(section) {
    // radio UI
    radios.forEach(r => r.checked = r.value === section);
    // esconder todas as sections e mostrar a selecionada
    sections.forEach(s => s.style.display = 'none');
    const selectedForm = document.getElementById(section);
    if (selectedForm) selectedForm.style.display = 'block';

    limparFormulario();

    if (section === 'produto') await carregarCategorias();
    if (section === 'funcionario') await carregarCargos();

    await carregarTabela(section);

    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    if (searchId) searchId.disabled = false;
}

// =======================
// CRUD (genérico para seção selecionada)
// =======================
async function buscarRegistro() {
    const id = (searchId && searchId.value) ? searchId.value.trim() : '';
    if (!id) return mostrarMensagem('Digite um ID', 'erro');

    const section = getSelectedSection();
    if (!section) return mostrarMensagem('Selecione uma seção', 'erro');

    try {
        if (section === 'produto') await carregarCategorias();
        if (section === 'funcionario') await carregarCargos();

        const res = await fetch(`${API_BASE_URL}/${section}/${id}`);
        if (res.ok) {
            const data = await res.json();
            preencherFormulario(data, section);

            // Bloquear ações de acordo com permissões (funcionário)
            if (section === 'funcionario') bloquearAcoesFuncionario(data);

            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            if (searchId) searchId.disabled = true;

            // guardar id atual
            currentId = data.id_funcionario || data.id_pessoa || data.id_produto || data.id_categoria || data.id_cargo || data.id || id;
        } else if (res.status === 404) {
            limparFormulario();
            mostrarBotoes(true, true, false, false, false, false); // permite incluir
            bloquearCampos(true); // permitir digitar dados
            if (searchId) searchId.disabled = false;
            mostrarMensagem('Registro não encontrado. Você pode incluir um novo.', 'erro');
        } else {
            mostrarMensagem('Erro ao buscar registro', 'erro');
        }
    } catch (err) {
        console.error(err);
        mostrarMensagem('Erro na requisição de busca', 'erro');
    }
}

function bloquearAcoesFuncionario(data) {
    const registroCargo = data.id_cargo;
    const registroId = data.id_funcionario;

    if (!usuarioLogado) return;

    // ADM (2) não pode se auto-alterar/excluir nem outro ADM
    if (usuarioLogado.id_cargo === 2) {
        if (registroCargo === 2 || registroId === usuarioLogado.id_pessoa) {
            btnAlterar.disabled = true;
            btnExcluir.disabled = true;
        } else {
            btnAlterar.disabled = false;
            btnExcluir.disabled = false;
        }
    }

    // CHEFE (3) não pode se auto-excluir
    if (usuarioLogado.id_cargo === 3) {
        btnAlterar.disabled = false;
        btnExcluir.disabled = registroId === usuarioLogado.id_pessoa;
    }
}

// =======================
// Salvar operação (incluir/alterar/excluir) - trata produto com upload
// =======================
async function salvarOperacao() {
    const section = getSelectedSection();
    if (!section) return mostrarMensagem('Selecione uma seção', 'erro');

    const inputs = document.querySelectorAll(`#${section} input, #${section} select`);
    let payload = {};
    let hasFile = false;
    let fileInputElement = null;

    // montar payload genérico e detectar file
    inputs.forEach(input => {
        if (input === searchId) return;
        if (input.type === 'file') {
            if (input.files && input.files.length > 0) { hasFile = true; fileInputElement = input; }
            return;
        }

        // mapear nomes para cada seção
        if (section === 'produto') {
            switch (input.id) {
                case 'produtoNome': payload.nome = input.value; break;
                case 'produtoCategoria': payload.id_categoria = input.value ? parseInt(input.value) : null; break;
                case 'produtoQtd': payload.quantidade_estoque = input.value ? parseInt(input.value) : 0; break;
                case 'produtoData': payload.data_fabricacao = input.value || null; break;
                case 'produtoPreco': payload.preco = input.value ? parseFloat(input.value) : 0; break;
            }
        } else if (section === 'pessoa') {
            if (input.id === 'pessoaNome') payload.nome = input.value;
            if (input.id === 'pessoaEmail') payload.email = input.value;
            if (input.id === 'pessoaSenha') payload.senha = input.value;
        } else if (section === 'categoria') {
            if (input.id === 'catNome') payload.nome_categoria = input.value;
        } else if (section === 'funcionario') {
            if (input.id === 'funcData') payload.data_inicio = input.value;
            if (input.id === 'funcSalario') payload.salario = input.value ? parseFloat(input.value) : 0;
            if (input.id === 'funcCargo') payload.id_cargo = input.value ? parseInt(input.value) : null;
        } else if (section === 'cargo') {
            if (input.id === 'cargoNome') payload.nome_cargo = input.value;
        }
    });

    // validações específicas
    if (section === 'produto' && (payload.nome === undefined || payload.nome === '' || payload.id_categoria === null)) {
        return mostrarMensagem('Nome e categoria são obrigatórios para o produto.', 'erro');
    }
    if (section === 'pessoa' && (!payload.nome || !payload.email || !payload.senha)) {
        return mostrarMensagem('Nome, email e senha são obrigatórios para pessoa.', 'erro');
    }

    // montar URL/method
    let url = `${API_BASE_URL}/${section}`;
    let method = 'POST';
    if (operacao === 'alterar') {
        if (!currentId && (!searchId || !searchId.value)) return mostrarMensagem('ID inválido para alterar', 'erro');
        const id = currentId || searchId.value;
        url = `${API_BASE_URL}/${section}/${id}`;
        method = 'PUT';
    } else if (operacao === 'excluir') {
        if (!currentId && (!searchId || !searchId.value)) return mostrarMensagem('ID inválido para excluir', 'erro');
        const id = currentId || searchId.value;
        url = `${API_BASE_URL}/${section}/${id}`;
        method = 'DELETE';
    }

    if (operacao === 'excluir' && !confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
        // ====== INCLUIR ======
        if (operacao === 'incluir') {
            if (section === 'produto') {
                // fluxo seguro: criar produto (JSON) e depois, se houver imagem, enviar a imagem para endpoint específico
                const createRes = await fetch(`${API_BASE_URL}/produto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!createRes.ok) {
                    const errBody = await createRes.json().catch(() => null);
                    return mostrarMensagem((errBody?.error || errBody?.message) || 'Erro ao incluir produto', 'erro');
                }
                const created = await createRes.json().catch(() => null);
                const createdId = created?.id_produto || created?.id;
                currentId = createdId;

                // se arquivo de imagem presente, enviar para /produto/:id/imagem
                if (hasFile && fileInputElement && createdId) {
                    const uploadForm = new FormData();
                    uploadForm.append('imagem', fileInputElement.files[0]);
                    const upRes = await fetch(`${API_BASE_URL}/produto/${createdId}/imagem`, {
                        method: 'POST',
                        body: uploadForm
                    });
                    if (!upRes.ok) {
                        mostrarMensagem('Produto criado, porém erro ao enviar imagem.', 'erro');
                    } else {
                        mostrarMensagem('Produto e imagem incluídos com sucesso!');
                    }
                } else {
                    mostrarMensagem('Produto incluído com sucesso!');
                }

                limparFormulario();
                mostrarBotoes(true, false, false, false, false, false);
                bloquearCampos(false);
                if (searchId) searchId.disabled = false;
                await carregarTabela(section);
                return;
            } else {
                // outras seções simples: postar JSON
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const errBody = await res.json().catch(() => null);
                    return mostrarMensagem((errBody?.error || errBody?.message) || 'Erro ao incluir registro', 'erro');
                }
                mostrarMensagem('Registro incluído com sucesso!');
                limparFormulario();
                mostrarBotoes(true, false, false, false, false, false);
                bloquearCampos(false);
                if (searchId) searchId.disabled = false;
                await carregarTabela(section);
                return;
            }
        }

        // ====== ALTERAR ======
        if (operacao === 'alterar') {
            const id = currentId || (searchId && searchId.value);
            if (!id) return mostrarMensagem('ID inválido para alterar', 'erro');

            // para produto: atualizar dados (JSON) via PUT e depois imagem se houver
            if (section === 'produto') {
                const res = await fetch(`${API_BASE_URL}/produto/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const errBody = await res.json().catch(() => null);
                    return mostrarMensagem((errBody?.error || errBody?.message) || 'Erro ao alterar produto', 'erro');
                }

                if (hasFile && fileInputElement) {
                    const uploadForm = new FormData();
                    uploadForm.append('imagem', fileInputElement.files[0]);
                    const upRes = await fetch(`${API_BASE_URL}/produto/${id}/imagem`, {
                        method: 'POST',
                        body: uploadForm
                    });
                    if (!upRes.ok) {
                        mostrarMensagem('Produto alterado, porém erro ao enviar imagem.', 'erro');
                    } else {
                        mostrarMensagem('Produto alterado e imagem atualizada!');
                    }
                } else {
                    mostrarMensagem('Produto alterado com sucesso!');
                }

                limparFormulario();
                mostrarBotoes(true, false, false, false, false, false);
                bloquearCampos(false);
                if (searchId) searchId.disabled = false;
                currentId = null;
                await carregarTabela(section);
                return;
            } else {
                // outras seções: PUT JSON
                const res = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const errBody = await res.json().catch(() => null);
                    return mostrarMensagem((errBody?.error || errBody?.message) || 'Erro ao alterar registro', 'erro');
                }
                mostrarMensagem('Registro alterado com sucesso!');
                limparFormulario();
                mostrarBotoes(true, false, false, false, false, false);
                bloquearCampos(false);
                if (searchId) searchId.disabled = false;
                currentId = null;
                await carregarTabela(section);
                return;
            }
        }

        // ====== EXCLUIR ======
        if (operacao === 'excluir') {
            const id = currentId || (searchId && searchId.value);
            if (!id) return mostrarMensagem('ID inválido para excluir', 'erro');
            if (!confirm('Tem certeza que deseja excluir este registro?')) return;

            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                return mostrarMensagem((errBody?.error || errBody?.message) || 'Erro ao excluir registro', 'erro');
            }
            mostrarMensagem('Registro excluído com sucesso!');
            limparFormulario();
            mostrarBotoes(true, false, false, false, false, false);
            bloquearCampos(false);
            if (searchId) searchId.disabled = false;
            currentId = null;
            await carregarTabela(section);
            return;
        }

        mostrarMensagem('Operação inválida', 'erro');
    } catch (err) {
        console.error(err);
        mostrarMensagem('Erro na requisição ao salvar', 'erro');
    }
}

// =======================
// Operações (UI)
// =======================
function incluirRegistro() {
    operacao = 'incluir';
    currentId = null;
    limparFormulario();
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    if (searchId) searchId.disabled = false;
}

function alterarRegistro() {
    operacao = 'alterar';
    if (!searchId.value && !currentId) return mostrarMensagem('Digite o ID antes de alterar', 'erro');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
}

function excluirRegistro() {
    operacao = 'excluir';
    if (!searchId.value && !currentId) return mostrarMensagem('Digite o ID antes de excluir', 'erro');
    mostrarBotoes(false, false, false, false, true, true);
    // manter campos bloqueados para visualização antes de confirmar exclusão
    bloquearCampos(false);
}

function cancelarOperacao() {
    operacao = null;
    currentId = null;
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    if (searchId) searchId.disabled = false;
}

// =======================
// Preencher formulário (genérico por seção)
// =======================
function preencherFormulario(data, section) {
    if (!data || typeof data !== 'object') return;

    // preencher apenas inputs/selects da section
    const scope = document.getElementById(section);
    if (!scope) return;

    scope.querySelectorAll('input, select, textarea').forEach(input => {
        if (input === searchId) return;

        let key = input.id;

        if (section === 'produto') {
            if (input.id === 'produtoNome') key = 'nome';
            else if (input.id === 'produtoCategoria') key = 'id_categoria';
            else if (input.id === 'produtoQtd') key = 'quantidade_estoque';
            else if (input.id === 'produtoData') key = 'data_fabricacao';
            else if (input.id === 'produtoPreco') key = 'preco';
            // file inputs: ignorar (não preenchíveis)
            if (input.type === 'file') return;
        } else if (section === 'pessoa') {
            if (input.id === 'pessoaNome') key = 'nome';
            if (input.id === 'pessoaEmail') key = 'email';
            if (input.id === 'pessoaSenha') key = 'senha';
        } else if (section === 'categoria') key = 'nome_categoria';
        else if (section === 'funcionario') {
            if (input.id === 'funcData') key = 'data_inicio';
            if (input.id === 'funcSalario') key = 'salario';
            if (input.id === 'funcCargo') key = 'id_cargo';
        } else if (section === 'cargo') key = 'nome_cargo';

        const value = data[key];
        if (value !== undefined && value !== null) {
            if (input.tagName === 'SELECT') input.value = String(value);
            else if (input.type === 'date') input.value = String(value).split('T')[0];
            else input.value = value;
        } else {
            // se não veio valor, limpar campo
            if (input.type !== 'file') input.value = '';
        }
    });

    // se houver imagem url no objeto retornado, tentar mostrar preview (se existir elemento)
    if (section === 'produto') {
        const preview = document.getElementById('produtoPreview');
        const imgUrl = data.imagem_url || data.imagem || data.imagemPath || data.imagem_nome;
        if (preview && imgUrl) {
            try { preview.src = imgUrl; preview.style.display = 'block'; } catch (e) {}
        } else if (preview) {
            preview.style.display = 'none';
        }
    }

    currentId = data.id_funcionario || data.id_pessoa || data.id_produto || data.id_categoria || data.id_cargo || data.id || (searchId && searchId.value);
    if (currentId && searchId) searchId.value = currentId;
}

// =======================
// Carregar selects
// =======================
async function carregarCategorias() {
    try {
        const res = await fetch(`${API_BASE_URL}/categoria`);
        if (!res.ok) return;
        const categorias = await res.json();
        const select = document.getElementById('produtoCategoria');
        if (!select) return;
        select.innerHTML = '<option value="">Selecione a Categoria</option>';
        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id_categoria;
            opt.textContent = cat.nome_categoria;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
        mostrarMensagem('Erro ao carregar categorias', 'erro');
    }
}

async function carregarCargos() {
    try {
        const res = await fetch(`${API_BASE_URL}/cargo`);
        if (!res.ok) return;
        const cargos = await res.json();
        const select = document.getElementById('funcCargo');
        if (!select) return;
        select.innerHTML = '<option value="">Selecione o Cargo</option>';
        cargos.forEach(cargo => {
            const opt = document.createElement('option');
            opt.value = cargo.id_cargo;
            opt.textContent = cargo.nome_cargo;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
        mostrarMensagem('Erro ao carregar cargos', 'erro');
    }
}

// =======================
// Carregar tabela (genérica por section)
// =======================
async function carregarTabela(section) {
    try {
        const tables = { funcionario: tableFuncionario, pessoa: tablePessoa, produto: tableProduto, categoria: tableCategoria, cargo: tableCargo };
        Object.values(tables).forEach(tbl => { if (tbl) { tbl.style.display = 'none'; tbl.innerHTML = ''; } });

        if (!section) return;
        const container = tables[section];
        if (!container) return;

        const res = await fetch(`${API_BASE_URL}/${section}`);
        if (!res.ok) {
            container.innerHTML = '<p>Erro ao carregar dados</p>';
            return;
        }

        const registros = await res.json();
        container.style.display = 'block';
        if (!Array.isArray(registros) || registros.length === 0) return container.innerHTML = '<p>Nenhum registro encontrado</p>';

        const table = document.createElement('table');
        table.classList.add('styled-table');

        const keys = Object.keys(registros[0]);
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const thAction = document.createElement('th');
        thAction.textContent = 'Ação';
        headerRow.appendChild(thAction);
        keys.forEach(k => {
            const th = document.createElement('th');
            th.textContent = capitalize(k);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const idKey = keys.find(k => k.startsWith('id_')) || keys[0];
        registros.forEach(reg => {
            const tr = document.createElement('tr');

            const tdAction = document.createElement('td');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'Abrir';
            btn.addEventListener('click', () => {
                setSection(section).then(() => {
                    if (searchId) searchId.value = reg[idKey];
                    buscarRegistro();
                });
            });
            tdAction.appendChild(btn);
            tr.appendChild(tdAction);

            keys.forEach(k => {
                const td = document.createElement('td');
                // se campo for imagem, mostrar nome/URL curto
                let text = reg[k];
                if ((k.toLowerCase().includes('imagem') || k.toLowerCase().includes('img')) && typeof text === 'string') {
                    // truncar URL/nome se muito longo
                    if (text.length > 40) text = text.slice(0, 37) + '...';
                }
                td.textContent = (text === null || text === undefined) ? '' : String(text);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
    } catch (err) {
        console.error(err);
        if (section && tables && tables[section]) tables[section].innerHTML = '<p>Erro ao carregar tabela</p>';
    }
}

// =======================
// Helpers
// =======================
function getSelectedSection() {
    const radio = document.querySelector('input[name="section"]:checked');
    return radio ? radio.value : null;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCookie(nome) {
    const valor = `; ${document.cookie}`;
    const partes = valor.split(`; ${nome}=`);
    if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
    return null;
}

// =======================
// Eventos dos botões
// =======================
btnBuscar.addEventListener('click', buscarRegistro);
btnIncluir.addEventListener('click', incluirRegistro);
btnAlterar.addEventListener('click', alterarRegistro);
btnExcluir.addEventListener('click', excluirRegistro);
btnSalvar.addEventListener('click', salvarOperacao);
btnCancelar.addEventListener('click', cancelarOperacao);

