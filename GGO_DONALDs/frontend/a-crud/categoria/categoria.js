document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = "http://localhost:3001/categoria";
    const form = document.getElementById("categoria");
    const searchInput = document.getElementById("searchCategoria");

    const btnBuscar = document.getElementById("btnBuscar");
    const btnIncluir = document.getElementById("btnIncluir");
    const btnAlterar = document.getElementById("btnAlterar");
    const btnExcluir = document.getElementById("btnExcluir");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    const tableDiv = document.getElementById("tableCategoria");

    let modo = "";
    let idAtual = null;

    // -----------------------------
    // Mensagens flutuantes
    // -----------------------------
    function mostrarMensagem(msg, tipo = "sucesso") {
        const msgBox = document.getElementById("msgBox") || (() => {
            const box = document.createElement("div");
            box.id = "msgBox";
            box.style.cssText = `
                position: fixed; top: 10px; right: 10px;
                padding: 10px 20px; border-radius: 5px;
                background-color: #4caf50; color: #fff;
                z-index: 999; display: none;
            `;
            document.body.appendChild(box);
            return box;
        })();

        msgBox.textContent = msg;
        msgBox.style.backgroundColor = tipo === "erro" ? "#f44336" : "#4caf50";
        msgBox.style.display = "block";

        setTimeout(() => { msgBox.style.display = "none" }, 3000);
    }

    // -----------------------------
    // Controle dos botões
    // -----------------------------
    function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
        btnBuscar.style.display   = btBuscar   ? "inline-block" : "none";
        btnIncluir.style.display  = btIncluir  ? "inline-block" : "none";
        btnAlterar.style.display  = btAlterar  ? "inline-block" : "none";
        btnExcluir.style.display  = btExcluir  ? "inline-block" : "none";
        btnSalvar.style.display   = btSalvar   ? "inline-block" : "none";
        btnCancelar.style.display = btCancelar ? "inline-block" : "none";
    }

    function limparFormulario() {
        if (!form) return;
        form.querySelectorAll("input").forEach(i => i.value = "");
        idAtual = null;
        modo = "";
        searchInput.value = "";
    }

    function bloquearCampos(editavel) {
        document.getElementById("catNome").disabled = !editavel;
    }

    // -----------------------------
    // Carregar tabela
    // -----------------------------
    async function carregarTabela() {
        try {
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error("HTTP " + res.status);

            const dados = await res.json();
            if (!Array.isArray(dados) || dados.length === 0) {
                tableDiv.innerHTML = "<p>Nenhuma categoria encontrada.</p>";
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
                html += `
                    <tr data-id="${c.id_categoria}">
                        <td>${c.id_categoria}</td>
                        <td>${c.nome_categoria}</td>
                    </tr>
                `;
            });

            html += "</table>";
            tableDiv.innerHTML = html;

            tableDiv.querySelectorAll("tr[data-id]").forEach(tr => {
                tr.addEventListener("click", () => {
                    const id = tr.getAttribute("data-id");
                    searchInput.value = id;
                    btnBuscar.click();
                });
            });

        } catch (err) {
            console.error(err);
            tableDiv.innerHTML = `<p style="color:red">Erro ao carregar tabela.</p>`;
        }
    }

    // -----------------------------
    // Buscar categoria
    // -----------------------------
    btnBuscar.addEventListener("click", async () => {
        const valor = searchInput.value.trim();
        if (!valor) return alert("Digite um ID!");

        try {
            const res = await fetch(`${API_BASE_URL}/${valor}`);

            if (res.status === 404) {
                limparFormulario();
                searchInput.value = valor;

                mostrarBotoes(true, true, false, false, false, true);
                bloquearCampos(true);

                return mostrarMensagem("Categoria não encontrada. Você pode incluir uma nova.", "erro");
            }

            if (!res.ok) return mostrarMensagem("Erro ao buscar categoria.", "erro");

            const c = await res.json();

            idAtual = c.id_categoria;
            document.getElementById("catId").value = c.id_categoria;
            document.getElementById("catNome").value = c.nome_categoria;

            bloquearCampos(false);
            mostrarBotoes(true, false, true, true, false, true);

        } catch (err) {
            console.error(err);
            mostrarMensagem("Erro ao buscar categoria.", "erro");
        }
    });

    // -----------------------------
    // Incluir
    // -----------------------------
    btnIncluir.addEventListener("click", () => {
        modo = "incluir";
        limparFormulario();
        bloquearCampos(true);
        mostrarBotoes(false, false, false, false, true, true);
    });

    // -----------------------------
    // Alterar
    // -----------------------------
    btnAlterar.addEventListener("click", () => {
        if (!idAtual) return mostrarMensagem("Busque uma categoria antes de alterar!", "erro");

        modo = "alterar";
        bloquearCampos(true);
        mostrarBotoes(false, false, false, false, true, true);
    });

    // -----------------------------
    // Excluir
    // -----------------------------
    btnExcluir.addEventListener("click", () => {
        if (!idAtual) return mostrarMensagem("Busque uma categoria antes de excluir!", "erro");

        modo = "excluir";
        bloquearCampos(false);
        mostrarBotoes(false, false, false, false, true, true);
    });

    // -----------------------------
    // Salvar operação
    // -----------------------------
    btnSalvar.addEventListener("click", async () => {
        const nome = document.getElementById("catNome").value.trim();

        if (!nome && modo !== "excluir")
            return alert("Nome da categoria é obrigatório!");

        let url = API_BASE_URL;
        let method = "POST";
        let payload = { nome_categoria: nome };

        if (modo === "alterar") {
            url += `/${idAtual}`;
            method = "PUT";
        } else if (modo === "excluir") {
            url += `/${idAtual}`;
            method = "DELETE";

            if (!confirm("Tem certeza que deseja excluir?"))
                return;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: method !== "DELETE" ? { "Content-Type": "application/json" } : undefined,
                body: method !== "DELETE" ? JSON.stringify(payload) : undefined
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                return mostrarMensagem(errBody?.error || "Erro ao salvar!", "erro");
            }

            mostrarMensagem("Operação realizada com sucesso!");

            limparFormulario();
            bloquearCampos(false);
            mostrarBotoes(true, false, false, false, false, false);

            await carregarTabela();
            modo = "";

        } catch (err) {
            console.error(err);
            mostrarMensagem("Erro ao salvar categoria.", "erro");
        }
    });

    // -----------------------------
    // Cancelar
    // -----------------------------
    btnCancelar.addEventListener("click", () => {
        limparFormulario();
        bloquearCampos(false);
        mostrarBotoes(true, false, false, false, false, false);
        modo = "";
    });

    // -----------------------------
    // Voltar
    // -----------------------------
    const btnVoltar = document.getElementById("btnVoltar");
    btnVoltar.addEventListener("click", () => {
        window.location.href = "../menu.html";
    });

    // -----------------------------
    // Inicialização
    // -----------------------------
    (async function init() {
        await carregarTabela();
        mostrarBotoes(true, false, false, false, false, false);
    })();

});
