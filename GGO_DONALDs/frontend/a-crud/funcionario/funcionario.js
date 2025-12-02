document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("btnVoltar").addEventListener("click", () => {
        window.location.href = "../menu.html";
    });


    const API_FUNC = "http://localhost:3001/funcionario";
    const API_CARGO = "http://localhost:3001/cargo";
    const API_PESSOA = "http://localhost:3001/pessoa";

    // Campos
    const funcData = document.getElementById("funcData");
    const funcSalario = document.getElementById("funcSalario");
    const funcCargo = document.getElementById("funcCargo");
    let funcPessoa = document.getElementById("funcPessoa"); // pode ser criado dinamicamente
    const searchId = document.getElementById("searchId");

    // Se select de pessoa não estiver no HTML, criaremos dinamicamente (fallback)
    if (!funcPessoa) {
        const formContainer = document.getElementById('funcionario') || document.querySelector('.section-form');
        if (formContainer) {
            // criar label + select + quebra de linha
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <label for="funcPessoa">Pessoa disponível:</label>
                <select id="funcPessoa"><option value="">-- carregando --</option></select>
                <br>
            `;
            formContainer.appendChild(wrapper);
            funcPessoa = document.getElementById('funcPessoa');
            console.info('Select #funcPessoa criado dinamicamente pelo script.');
        } else {
            console.warn('Não foi possível localizar container do formulário para injetar select funcPessoa.');
        }
    }

    const btnBuscar = document.getElementById("btnBuscar");
    const btnIncluir = document.getElementById("btnIncluir");
    const btnAlterar = document.getElementById("btnAlterar");
    const btnExcluir = document.getElementById("btnExcluir");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    const tableDiv = document.getElementById("tableFuncionario");

    let modo = "";
    let idAtual = null;

    let cargoMap = {};
    let pessoaMap = {};

    // -------------------------
    // UI helpers
    // -------------------------
    function setInitialButtons() {
        btnBuscar.style.display = "inline-block";
        btnIncluir.style.display = "none";
        btnAlterar.style.display = "none";
        btnExcluir.style.display = "none";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "none";
    }

    function showAfterFound() {
        btnBuscar.style.display = "inline-block";
        btnIncluir.style.display = "none";
        btnAlterar.style.display = "inline-block";
        btnExcluir.style.display = "inline-block";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "inline-block";
    }

    function showAfterNotFound() {
        btnBuscar.style.display = "inline-block";
        btnIncluir.style.display = "inline-block";
        btnAlterar.style.display = "none";
        btnExcluir.style.display = "none";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "inline-block";
    }

    function showEditingButtons() {
        btnBuscar.style.display = "none";
        btnIncluir.style.display = "none";
        btnAlterar.style.display = "none";
        btnExcluir.style.display = "none";
        btnSalvar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
    }

    function limparFormulario() {
        funcData.value = "";
        funcSalario.value = "";
        funcCargo.value = "";
        if (funcPessoa) funcPessoa.value = "";
        idAtual = null;
        modo = "";
    }

    // -------------------------
    // carregar cargos
    // -------------------------
    async function carregarCargos() {
        try {
            const res = await fetch(API_CARGO);
            const dados = await res.json();

            funcCargo.innerHTML = "<option value=''>-- selecione --</option>";
            cargoMap = {};

            (dados || []).forEach(c => {
                const id = c.id_cargo ?? c.id ?? c.idCargo;
                const nome = c.nome_cargo ?? c.nome ?? c.nomeCargo;
                if (id == null) return;
                cargoMap[id] = nome;
                funcCargo.innerHTML += `<option value="${id}">${escapeHtml(nome)}</option>`;
            });

        } catch (err) {
            console.error("Erro carregarCargos:", err);
        }
    }

    // -------------------------
    // carregar pessoas
    // -------------------------
    async function carregarPessoas() {
        try {
            const res = await fetch(API_PESSOA);
            const dados = await res.json();

            pessoaMap = {};
            (dados || []).forEach(p => {
                const id = p.id_pessoa ?? p.id ?? p.idPessoa;
                const nome = p.nome ?? p.name;
                if (id == null) return;
                pessoaMap[id] = nome || `Pessoa ${id}`;
            });

        } catch (err) {
            console.warn("Erro carregarPessoas:", err);
        }
    }

    // -------------------------
    // carregar PESSOAS DISPONÍVEIS para inclusão
    // -------------------------
    async function carregarPessoasDisponiveis() {
        try {
            const [resPessoas, resFunc] = await Promise.all([
                fetch(API_PESSOA),
                fetch(API_FUNC)
            ]);

            const pessoas = await resPessoas.json();
            const funcionarios = await resFunc.json();

            const usados = new Set(
                (funcionarios || []).map(f => f.id_pessoa ?? f.idPessoa)
            );

            // garantir pessoaMap atualizado
            pessoaMap = {};
            (pessoas || []).forEach(p => {
                const id = p.id_pessoa ?? p.idPessoa ?? p.id;
                const nome = p.nome ?? p.name;
                if (id != null) pessoaMap[id] = nome || `Pessoa ${id}`;
            });

            if (funcPessoa) {
                // limpa e monta opções com pessoas que não estão em Funcionario
                funcPessoa.innerHTML = "<option value=''>-- selecione --</option>";

                (pessoas || []).forEach(p => {
                    const id = p.id_pessoa ?? p.idPessoa ?? p.id;
                    const nome = p.nome ?? p.name ?? `Pessoa ${id}`;
                    if (!usados.has(id)) {
                        const opt = document.createElement('option');
                        opt.value = id;
                        opt.textContent = nome;
                        funcPessoa.appendChild(opt);
                    }
                });
            }
        } catch (err) {
            console.error("Erro carregarPessoasDisponiveis:", err);
        }
    }

    // -------------------------
    // carregar tabela
    // -------------------------
    async function carregarTabela() {
        try {
            const res = await fetch(API_FUNC);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const dados = await res.json();
            if (!Array.isArray(dados) || dados.length === 0) {
                tableDiv.innerHTML = "<p>Nenhum funcionário encontrado.</p>";
                return;
            }

            let html = `
                <table border="1" cellspacing="0" cellpadding="6">
                    <tr>
                        <th>ID</th>
                        <th>Pessoa</th>
                        <th>Data Início</th>
                        <th>Salário</th>
                        <th>Cargo</th>
                    </tr>
            `;

            dados.forEach(f => {
                let dataInicio = f.data_inicio ?? f.dataInicio ?? "";
                if (typeof dataInicio === "string" && dataInicio.includes("T"))
                    dataInicio = dataInicio.split("T")[0];

                const nomePessoa = f.nome_pessoa ?? pessoaMap[f.id_pessoa] ?? "";
                const nomeCargo = f.nome_cargo ?? cargoMap[f.id_cargo] ?? "";

                html += `
                    <tr data-id="${escapeHtml(String(f.id_funcionario))}">
                        <td>${escapeHtml(String(f.id_funcionario))}</td>
                        <td>${escapeHtml(nomePessoa)}</td>
                        <td>${escapeHtml(dataInicio)}</td>
                        <td>${escapeHtml(String(f.salario ?? ""))}</td>
                        <td>${escapeHtml(nomeCargo)}</td>
                    </tr>
                `;
            });

            html += "</table>";
            tableDiv.innerHTML = html;

            tableDiv.querySelectorAll("tr[data-id]").forEach(tr => {
                tr.addEventListener("click", () => {
                    const id = tr.getAttribute("data-id");
                    searchId.value = id;
                    btnBuscar.click();
                });
            });

        } catch (err) {
            console.error("Erro carregarTabela:", err);
            tableDiv.innerHTML = `<p style="color:red">Erro ao carregar tabela: ${escapeHtml(err.message)}</p>`;
        }
    }

    // -------------------------
    // buscar
    // -------------------------
    btnBuscar.addEventListener("click", async () => {
        const id = searchId.value.trim();
        if (!id) return alert("Digite o ID!");

        try {
            const res = await fetch(`${API_FUNC}/${id}`);

            if (res.ok) {
                const f = await res.json();
                idAtual = f.id_funcionario ?? f.id ?? null;
                modo = "visualizar";

                // normalizar data_inicio (trata strings, nulls, etc)
                let dataInicioRaw = f.data_inicio ?? f.dataInicio ?? "";
                if (dataInicioRaw && typeof dataInicioRaw === "string" && dataInicioRaw.includes("T")) {
                    dataInicioRaw = dataInicioRaw.split("T")[0];
                }
                funcData.value = dataInicioRaw || "";

                funcSalario.value = (f.salario ?? "") === null ? "" : String(f.salario ?? "");
                funcCargo.value = f.id_cargo ?? f.idCargo ?? "";

                // -> garantir que o select de pessoas disponiveis esteja carregado
                await carregarPessoasDisponiveis(); // popula funcPessoa e pessoaMap

                // Mostrar a pessoa vinculada no select (se existir) e BLOQUEAR para edição
                if (funcPessoa) {
                    const pessoaId = f.id_pessoa ?? f.idPessoa ?? null;
                    // se opção já existe, define; se não, cria uma option temporária com nome
                    if (pessoaId) {
                        const optExist = Array.from(funcPessoa.options).some(o => String(o.value) === String(pessoaId));
                        if (!optExist) {
                            // criar option temporária para mostrar a pessoa vinculada
                            const tempOpt = document.createElement('option');
                            tempOpt.value = pessoaId;
                            // preferir nome retornado do endpoint /funcionario (f.nome_pessoa) senão pessoaMap
                            tempOpt.textContent = f.nome_pessoa ?? pessoaMap[pessoaId] ?? `Pessoa ${pessoaId}`;
                            // colocar no início para facilitar seleção visual
                            funcPessoa.prepend(tempOpt);
                        }
                        funcPessoa.value = String(pessoaId);
                    } else {
                        // sem pessoa associada (improvável), limpar
                        funcPessoa.value = "";
                    }
                    funcPessoa.disabled = true; // bloquear sempre após buscar
                }

                showAfterFound();

            } else if (res.status === 404) {
                limparFormulario();
                // garantir select populado para inclusão futura
                await carregarPessoasDisponiveis();
                searchId.value = id;
                showAfterNotFound();
                alert("Registro não encontrado. Você pode incluir um novo.");
            } else {
                alert("Erro ao buscar funcionário.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro na requisição de busca.");
        }
    });

    // -------------------------
    // Incluir
    // -------------------------
    btnIncluir.addEventListener("click", async () => {
        modo = "incluir";
        idAtual = null;
        funcData.value = "";
        funcSalario.value = "";
        funcCargo.value = "";
        if (funcPessoa) {
            // recarregar disponíveis antes de incluir (garante lista atualizada)
            await carregarPessoasDisponiveis();
            funcPessoa.value = "";
            funcPessoa.disabled = false; // permitir seleção ao incluir
        }
        showEditingButtons();
    });

    // -------------------------
    // Alterar
    // -------------------------
    btnAlterar.addEventListener("click", () => {
        if (!searchId.value.trim()) return alert("Busque um funcionário antes de alterar.");
        modo = "alterar";
        // bloquear alteração da pessoa no modo alterar
        if (funcPessoa) funcPessoa.disabled = true;
        showEditingButtons();
    });

    // -------------------------
    // Excluir
    // -------------------------
    btnExcluir.addEventListener("click", () => {
        if (!searchId.value.trim()) return alert("Busque um funcionário antes de excluir.");
        modo = "excluir";

        funcData.disabled = true;
        funcSalario.disabled = true;
        funcCargo.disabled = true;
        if (funcPessoa) funcPessoa.disabled = true;

        showEditingButtons();
    });

    // -------------------------
    // Salvar
    // -------------------------
    btnSalvar.addEventListener("click", async () => {
        try {
            if (!modo) return alert("Nenhuma operação selecionada.");

            if (modo === "incluir") {

                // VALIDAÇÃO: converter e checar id_pessoa (usar ID real da tabela Pessoa)
                const chosenPessoaRaw = funcPessoa ? funcPessoa.value : null;
                const chosenPessoaId = chosenPessoaRaw === null || chosenPessoaRaw === '' ? null : Number(chosenPessoaRaw);
                if (!Number.isInteger(chosenPessoaId) || chosenPessoaId <= 0) {
                    return alert("Selecione uma pessoa válida para incluir (id_pessoa inválido).");
                }

                const payload = {
                    id_pessoa: chosenPessoaId,
                    data_inicio: funcData.value || null,
                    salario: funcSalario.value ? Number(funcSalario.value) : null,
                    id_cargo: funcCargo.value ? Number(funcCargo.value) : null
                };

                const res = await fetch(API_FUNC, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    alert("Erro ao incluir: " + (err?.error || `status ${res.status}`));
                    return;
                }
                alert("Funcionário incluído com sucesso!");

            } else if (modo === "alterar") {

                if (!idAtual) return alert("ID inválido para alterar.");
                const payload = {
                    data_inicio: funcData.value || null,
                    salario: funcSalario.value ? Number(funcSalario.value) : null,
                    id_cargo: funcCargo.value ? Number(funcCargo.value) : null
                };
                const res = await fetch(`${API_FUNC}/${idAtual}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) return alert("Erro ao alterar.");
                alert("Alterado com sucesso!");

            } else if (modo === "excluir") {

                if (!idAtual) return alert("ID inválido para excluir.");
                if (!confirm("Confirma exclusão?")) {
                    funcData.disabled = false;
                    funcSalario.disabled = false;
                    funcCargo.disabled = false;
                    if (funcPessoa) funcPessoa.disabled = true;
                    showAfterFound();
                    modo = "visualizar";
                    return;
                }
                const res = await fetch(`${API_FUNC}/${idAtual}`, { method: "DELETE" });
                if (!res.ok) return alert("Erro ao excluir.");
                alert("Excluído com sucesso!");
            }

            await Promise.all([carregarCargos(), carregarPessoas(), carregarPessoasDisponiveis()]);
            await carregarTabela();

            limparFormulario();
            funcData.disabled = false;
            funcSalario.disabled = false;
            funcCargo.disabled = false;
            if (funcPessoa) funcPessoa.disabled = false; // padrão após salvar
            setInitialButtons();
            searchId.value = "";

        } catch (err) {
            console.error(err);
            alert("Erro ao salvar operação.");
        }
    });

    // -------------------------
    // Cancelar
    // -------------------------
    btnCancelar.addEventListener("click", () => {
        limparFormulario();
        funcData.disabled = false;
        funcSalario.disabled = false;
        funcCargo.disabled = false;
        if (funcPessoa) funcPessoa.disabled = false;
        setInitialButtons();
        searchId.value = "";
    });

    // -------------------------
    // Init
    // -------------------------
    (async function init() {
        await Promise.all([
            carregarCargos(),
            carregarPessoas(),
            carregarPessoasDisponiveis()
        ]);
        await carregarTabela();
        setInitialButtons();
    })();

    // -------------------------
    // helpers
    // -------------------------
    function escapeHtml(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
