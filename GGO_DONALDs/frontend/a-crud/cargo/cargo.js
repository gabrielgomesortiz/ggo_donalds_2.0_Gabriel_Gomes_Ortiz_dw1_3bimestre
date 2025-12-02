document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = 'http://localhost:3001/cargo';
    const form = document.getElementById('cargo');
    const searchId = document.getElementById('searchId');

    const btnBuscar = document.getElementById('btnBuscar');
    const btnIncluir = document.getElementById('btnIncluir');
    const btnAlterar = document.getElementById('btnAlterar');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnCancelar = document.getElementById('btnCancelar');

    const tableDiv = document.getElementById('tableCargo');

    let modo = "";
    let idAtual = null;

    // -------------------------
    // UI helpers
    // -------------------------
    function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
        btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
        btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
        btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
        btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
        btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
        btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
    }

    function limparFormulario() {
        if (!form) return;
        form.querySelectorAll('input, select, textarea').forEach(i => i.value = '');
        idAtual = null;
        modo = "";
        if (searchId) searchId.value = "";
    }

    function bloquearCampos(editavel) {
        if (!form) return;
        form.querySelectorAll('input').forEach(i => i.disabled = !editavel);
    }

    function mostrarMensagem(msg, tipo = 'sucesso') {
        const msgBox = document.getElementById('msgBox') || (() => {
            const box = document.createElement('div');
            box.id = 'msgBox';
            box.style.cssText = `
                position: fixed; top: 10px; right: 10px; padding: 10px 20px;
                border-radius: 5px; background-color: #4caf50; color: #fff;
                display: none; z-index: 999;
            `;
            document.body.appendChild(box);
            return box;
        })();
        msgBox.textContent = msg;
        msgBox.style.backgroundColor = tipo === 'erro' ? '#f44336' : '#4caf50';
        msgBox.style.display = 'block';
        setTimeout(() => { msgBox.style.display = 'none'; }, 3000);
    }

    // -------------------------
    // Carregar tabela
    // -------------------------
    async function carregarTabela() {
        try {
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const dados = await res.json();
            if (!Array.isArray(dados) || dados.length === 0) {
                tableDiv.innerHTML = "<p>Nenhum cargo encontrado.</p>";
                return;
            }

            let html = `
                <table border="1" cellspacing="0" cellpadding="6">
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                    </tr>
            `;
            dados.forEach(c => {
                const id = c.id_cargo ?? c.id ?? "";
                const nome = c.nome_cargo ?? c.nome ?? "";
                html += `
                    <tr data-id="${id}">
                        <td>${id}</td>
                        <td>${nome}</td>
                    </tr>
                `;
            });
            html += "</table>";
            tableDiv.innerHTML = html;

            tableDiv.querySelectorAll('tr[data-id]').forEach(tr => {
                tr.addEventListener('click', () => {
                    const id = tr.getAttribute('data-id');
                    searchId.value = id;
                    btnBuscar.click();
                });
            });

        } catch (err) {
            console.error(err);
            tableDiv.innerHTML = `<p style="color:red">Erro ao carregar tabela: ${err.message}</p>`;
        }
    }

    // -------------------------
    // Buscar
    // -------------------------
    btnBuscar.addEventListener('click', async () => {
        const id = searchId.value.trim();
        if (!id) return alert('Digite o ID!');
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`);
            if (res.ok) {
                const c = await res.json();
                idAtual = c.id_cargo ?? c.id ?? null;
                document.getElementById('cargoNome').value = c.nome_cargo ?? c.nome ?? '';
                mostrarBotoes(true, false, true, true, false, true);
                bloquearCampos(false);
            } else if (res.status === 404) {
                limparFormulario();
                searchId.value = id;
                mostrarBotoes(true, true, false, false, false, true);
                bloquearCampos(true);
                alert('Registro não encontrado. Você pode incluir um novo.');
            } else {
                alert('Erro ao buscar cargo.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro na requisição de busca.');
        }
    });

    // -------------------------
    // Incluir
    // -------------------------
    btnIncluir.addEventListener('click', () => {
        modo = 'incluir';
        idAtual = null;
        limparFormulario();
        bloquearCampos(true);
        mostrarBotoes(false, false, false, false, true, true);
    });

    // -------------------------
    // Alterar
    // -------------------------
    btnAlterar.addEventListener('click', () => {
        if (!idAtual && !searchId.value.trim()) return alert('Busque um cargo antes de alterar.');
        modo = 'alterar';
        bloquearCampos(true);
        mostrarBotoes(false, false, false, false, true, true);
    });

    // -------------------------
    // Excluir
    // -------------------------
    btnExcluir.addEventListener('click', () => {
        if (!idAtual && !searchId.value.trim()) return alert('Busque um cargo antes de excluir.');
        modo = 'excluir';
        bloquearCampos(false);
        mostrarBotoes(false, false, false, false, true, true);
    });

    // -------------------------
    // Salvar
    // -------------------------
    btnSalvar.addEventListener('click', async () => {
        const nome = document.getElementById('cargoNome').value.trim();
        if (!nome) return alert('Nome do cargo é obrigatório.');

        let url = API_BASE_URL;
        let method = 'POST';
        const payload = { nome_cargo: nome };

        if (modo === 'alterar') {
            const id = idAtual || searchId.value;
            if (!id) return alert('ID inválido para alterar.');
            url += `/${id}`;
            method = 'PUT';
        } else if (modo === 'excluir') {
            const id = idAtual || searchId.value;
            if (!id) return alert('ID inválido para excluir.');
            url += `/${id}`;
            method = 'DELETE';
            if (!confirm('Tem certeza que deseja excluir este cargo?')) return;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: method !== 'DELETE' ? { 'Content-Type': 'application/json' } : undefined,
                body: method !== 'DELETE' ? JSON.stringify(payload) : undefined
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                return alert((errBody?.error || errBody?.message) || 'Erro na operação');
            }

            alert(`${modo.charAt(0).toUpperCase() + modo.slice(1)} realizada com sucesso!`);
            limparFormulario();
            mostrarBotoes(true, false, false, false, false, false);
            bloquearCampos(false);
            await carregarTabela();
            modo = '';
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar operação.');
        }
    });

    // -------------------------
    // Cancelar
    // -------------------------
    btnCancelar.addEventListener('click', () => {
        limparFormulario();
        bloquearCampos(false);
        mostrarBotoes(true, false, false, false, false, false);
        modo = '';
    });

    // -------------------------
    // Botão voltar
    // -------------------------
    const btnVoltar = document.getElementById("btnVoltar");
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            window.location.href = "../menu.html";
        });
    }

    // -------------------------
    // Init
    // -------------------------
    (async function init() {
        await carregarTabela();
        mostrarBotoes(true, false, false, false, false, false);
    })();

});
