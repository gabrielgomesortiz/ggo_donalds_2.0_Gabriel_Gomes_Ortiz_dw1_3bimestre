document.addEventListener("DOMContentLoaded", () => {

    // ====================================
    // BOTÃO VOLTAR
    // ====================================
    document.getElementById("btnVoltar").addEventListener("click", () => {
        window.location.href = "../menu.html";
    });

    const API_PESSOA = "http://localhost:3001/pessoa";

    // Campos
    const pessoaNome = document.getElementById("pessoaNome");
    const pessoaEmail = document.getElementById("pessoaEmail");
    const pessoaSenha = document.getElementById("pessoaSenha");
    const searchId = document.getElementById("searchId");

    const btnBuscar = document.getElementById("btnBuscar");
    const btnIncluir = document.getElementById("btnIncluir");
    const btnAlterar = document.getElementById("btnAlterar");
    const btnExcluir = document.getElementById("btnExcluir");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    const tableDiv = document.getElementById("tablePessoa");

    let modo = "";
    let idAtual = null;

    // ====================================
    // ESCAPAR HTML
    // ====================================
    function escapeHtml(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ====================================
    // UI helpers
    // ====================================
    function setInitialButtons() {
        btnBuscar.style.display = "inline-block";
        btnIncluir.style.display = "none"; // igual ao funcionário
        btnAlterar.style.display = "none";
        btnExcluir.style.display = "none";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "none";

        searchId.disabled = false;

        pessoaNome.disabled = false;
        pessoaEmail.disabled = false;
        pessoaSenha.disabled = false;
    }

    function showAfterFound() {
        btnBuscar.style.display = "inline-block";
        btnIncluir.style.display = "none";
        btnAlterar.style.display = "inline-block";
        btnExcluir.style.display = "inline-block";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "inline-block";

        searchId.disabled = true;

        pessoaNome.disabled = true;
        pessoaEmail.disabled = true;
        pessoaSenha.disabled = true;
    }

    function showAfterNotFound() {
        btnBuscar.style.display = "inline-block";
        btnIncluir.style.display = "inline-block";
        btnAlterar.style.display = "none";
        btnExcluir.style.display = "none";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "inline-block";

        searchId.disabled = false;

        pessoaNome.disabled = false;
        pessoaEmail.disabled = false;
        pessoaSenha.disabled = false;
    }

    function showEditingButtons() {
        btnBuscar.style.display = "none";
        btnIncluir.style.display = "none";
        btnAlterar.style.display = "none";
        btnExcluir.style.display = "none";
        btnSalvar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";

        pessoaNome.disabled = false;
        pessoaEmail.disabled = false;
        pessoaSenha.disabled = false;

        searchId.disabled = true;
    }

    function limparFormulario() {
        pessoaNome.value = "";
        pessoaEmail.value = "";
        pessoaSenha.value = "";
        idAtual = null;
        modo = "";
    }

    // ====================================
    // CARREGAR TABELA
    // ====================================
    async function carregarTabela() {
        try {
            const res = await fetch(API_PESSOA);
            if (!res.ok) throw new Error("Erro ao carregar tabela");

            const dados = await res.json();

            if (!dados.length) {
                tableDiv.innerHTML = "<p>Nenhuma pessoa cadastrada.</p>";
                return;
            }

            let html = `
                <table border="1" cellspacing="0" cellpadding="6">
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                    </tr>
            `;

            dados.forEach(p => {
                html += `
                    <tr data-id="${escapeHtml(p.id_pessoa)}">
                        <td>${escapeHtml(p.id_pessoa)}</td>
                        <td>${escapeHtml(p.nome)}</td>
                        <td>${escapeHtml(p.email)}</td>
                    </tr>
                `;
            });

            html += "</table>";
            tableDiv.innerHTML = html;

            tableDiv.querySelectorAll("tr[data-id]").forEach(tr => {
                tr.addEventListener("click", () => {
                    searchId.value = tr.getAttribute("data-id");
                    btnBuscar.click();
                });
            });

        } catch (err) {
            console.error(err);
            tableDiv.innerHTML = "<p style='color:red'>Erro ao carregar tabela.</p>";
        }
    }

    // ====================================
    // BUSCAR
    // ====================================
    btnBuscar.addEventListener("click", async () => {
        const id = searchId.value.trim();
        if (!id) return alert("Digite um ID!");

        try {
            const res = await fetch(`${API_PESSOA}/${id}`);

            if (res.ok) {
                const p = await res.json();

                pessoaNome.value = p.nome;
                pessoaEmail.value = p.email;
                pessoaSenha.value = p.senha;

                idAtual = p.id_pessoa;
                modo = "visualizar";

                showAfterFound();
            }
            else if (res.status === 404) {
                limparFormulario();
                showAfterNotFound();
                alert("Pessoa não encontrada — você pode incluir.");
            }
            else {
                alert("Erro ao buscar registro.");
            }

        } catch (err) {
            console.error(err);
            alert("Erro na requisição.");
        }
    });

    // ====================================
    // INCLUIR
    // ====================================
    btnIncluir.addEventListener("click", () => {
        limparFormulario();
        searchId.value = "";
        modo = "incluir";
        showEditingButtons();
    });

    // ====================================
    // ALTERAR
    // ====================================
    btnAlterar.addEventListener("click", () => {
        if (!idAtual) return alert("Busque uma pessoa antes.");
        modo = "alterar";
        showEditingButtons();
    });

    // ====================================
    // EXCLUIR
    // ====================================
    btnExcluir.addEventListener("click", () => {
        if (!idAtual) return alert("Busque uma pessoa antes de excluir.");
        modo = "excluir";

        pessoaNome.disabled = true;
        pessoaEmail.disabled = true;
        pessoaSenha.disabled = true;

        showEditingButtons();
    });

    // ====================================
    // SALVAR
    // ====================================
    btnSalvar.addEventListener("click", async () => {
        try {
            if (!modo) return alert("Nenhuma operação selecionada.");

            const payload = {
                nome: pessoaNome.value.trim(),
                email: pessoaEmail.value.trim(),
                senha: pessoaSenha.value.trim()
            };

            if (modo !== "excluir" && (!payload.nome || !payload.email || !payload.senha))
                return alert("Preencha todos os campos!");

            if (modo === "incluir") {
                const res = await fetch(API_PESSOA, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) return alert("Erro ao incluir.");
                alert("Pessoa incluída!");

            } else if (modo === "alterar") {
                const res = await fetch(`${API_PESSOA}/${idAtual}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) return alert("Erro ao alterar.");
                alert("Alterado!");

            } else if (modo === "excluir") {
                if (!confirm("Excluir DEFINITIVAMENTE?")) {
                    showAfterFound();
                    return;
                }
                const res = await fetch(`${API_PESSOA}/${idAtual}`, { method: "DELETE" });
                if (!res.ok) return alert("Erro ao excluir.");
                alert("Excluído!");
            }

            await carregarTabela();
            limparFormulario();
            setInitialButtons();
            searchId.value = "";

        } catch (err) {
            console.error(err);
            alert("Erro ao salvar.");
        }
    });

    // ====================================
    // CANCELAR
    // ====================================
    btnCancelar.addEventListener("click", () => {
        limparFormulario();
        setInitialButtons();
    });

    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    (async function init() {
        await carregarTabela();
        setInitialButtons();
    })();

    // Enter = Buscar
    searchId.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnBuscar.click();
        }
    });

});
