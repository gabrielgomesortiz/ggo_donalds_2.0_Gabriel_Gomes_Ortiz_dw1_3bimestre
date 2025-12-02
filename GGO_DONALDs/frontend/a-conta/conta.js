// conta.js
const PEDIDO_KEY = 'pedidoAtual';
const API_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', function () {
    // ==============================
    // Checar usuário no cookie
    // ==============================
    const usuarioStr = getCookie("usuario");
    if (!usuarioStr) {
        alert("Faça login antes de continuar.");
        window.location.href = "../a-login/login.html";
        return;
    } else {
        console.log("Usuário na conta:", usuarioStr);
    }

    // ==============================
    // Carregar pedido
    // ==============================
    const pedidoJSON = localStorage.getItem(PEDIDO_KEY);

    if (!pedidoJSON) {
        mostrarMensagemErro('Nenhum pedido encontrado.');
        return;
    }

    try {
        const pedido = JSON.parse(pedidoJSON);
        exibirPedido(pedido);
    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        mostrarMensagemErro('Erro ao carregar o pedido.');
    }

    configurarBotoes();
});

// ==============================
// Funções de exibição
// ==============================
function exibirPedido(pedido) {
    const container = document.querySelector('.conta');
    container.innerHTML = '';

    ['hamburgueres', 'acompanhamentos', 'bebidas'].forEach(categoria => {
        const itensValidos = pedido.pedidos[categoria]?.filter(i => i.quantidade > 0);
        if (itensValidos && itensValidos.length > 0) {
            const tituloCategoria = document.createElement('h2');
            tituloCategoria.className = 'categoria-titulo';
            tituloCategoria.textContent = formatarTituloCategoria(categoria);
            container.appendChild(tituloCategoria);

            adicionarItens(container, itensValidos);
        }
    });

    if (pedido.totalGeral > 0) {
        const totalDiv = document.createElement('div');
        totalDiv.className = 'conta-total';
        totalDiv.innerHTML = `
            <p>Total a pagar: <span>R$ ${pedido.totalGeral.toFixed(2)}</span></p>
            <p>Itens: ${pedido.itensTotais}</p>
            <p>Data: ${pedido.data}</p>
        `;
        container.appendChild(totalDiv);
    }
}

function adicionarItens(container, itens) {
    itens.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'conta-item';
        itemDiv.innerHTML = `
            <p class="coluna_nome">${item.nome}</p>
            <p class="coluna_quantidade">${item.quantidade}x</p>
            <p class="coluna_preco">R$ ${item.precoTotal.toFixed(2)}</p>
        `;
        container.appendChild(itemDiv);
    });
}

function formatarTituloCategoria(categoria) {
    const titulos = {
        'hamburgueres': 'Hambúrgueres:',
        'acompanhamentos': 'Acompanhamentos:',
        'bebidas': 'Bebidas:'
    };
    return titulos[categoria] || categoria;
}

function mostrarMensagemErro(mensagem) {
    document.querySelector('.conta').innerHTML = `
        <p class="mensagem-erro">${mensagem}</p>
        <button onclick="window.location.href='../index.html'">Voltar ao cardápio</button>
    `;
}

// ==============================
// Botões
// ==============================
function configurarBotoes() {
    const botoes = document.querySelectorAll('.buttons_volta_prosseguir');
    if (botoes.length < 2) return;

    botoes[0].addEventListener('click', voltarParaCardapio);
    // O botão “prosseguir” agora registra pagamento (status false), pedido e itens no servidor antes de redirecionar
    botoes[1].addEventListener('click', async (e) => {
        try {
            await registrarPedidoPendente(); // registra tudo com status_pagamento = false
            // após registrar, redireciona para página de pagamento onde usuário finaliza/visualiza
            window.location.href = '../a-pagamento/pagamento.html';
        } catch (err) {
            console.error('Erro ao registrar pedido pendente:', err);
            alert('Erro ao registrar pedido. Tente novamente.');
        }
    });
}

function voltarParaCardapio() {
    window.location.href = '../index.html';
}

// ==============================
// Registro de pedido pendente (novo)
// ==============================
async function registrarPedidoPendente() {
    // Pega usuário
    const usuarioStr = getCookie("usuario");
    if (!usuarioStr) throw new Error('Usuário não autenticado.');
    const usuario = JSON.parse(usuarioStr);
    const id_pessoa = usuario.id_pessoa;
    if (!id_pessoa) throw new Error('ID do usuário não encontrado.');

    // Pega pedido local
    const pedidoAtual = JSON.parse(localStorage.getItem(PEDIDO_KEY));
    if (!pedidoAtual || !pedidoAtual.pedidos) throw new Error('Nenhum pedido encontrado no localStorage.');

    // Monta itens no formato esperado pelo backend
    const categorias = ['hamburgueres', 'acompanhamentos', 'bebidas'];
    const itens = [];
    for (const cat of categorias) {
        const arr = pedidoAtual.pedidos[cat] || [];
        for (const item of arr) {
            if (!item || !item.id || !item.quantidade) continue;
            itens.push({
                id_produto: item.id,
                quantidade: item.quantidade,
                preco_unitario: item.precoUnitario ?? item.preco
            });
        }
    }

    if (itens.length === 0) throw new Error('Pedido sem itens.');

    // Observação: Forma de pagamento obrigatória no banco. Aqui usamos 2 (Pix) como padrão.
    // Se preferir, ajuste para 1 (Cartão) ou receba do usuário.
    const id_forma_pagamento_padrao = 2;

    const res = await fetch(`${API_URL}/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_pessoa: id_pessoa,
            id_forma_pagamento: id_forma_pagamento_padrao,
            status_pagamento: false, // registro como PENDENTE
            itens
        })
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => 'Erro desconhecido');
        throw new Error(`Falha ao registrar pagamento: ${txt}`);
    }

    const resJson = await res.json();

    // salvar resposta para uso posterior (ex: confirmar pagamento na tela de pagamento)
    try {
        // Normaliza formato salvo para garantir pagamento.id_pagamento
        const normalized = {
            pagamento: resJson.pagamento || { id_pagamento: resJson.id_pagamento },
            pedido: resJson.pedido || resJson,
            itens: resJson.itens || []
        };
        localStorage.setItem('ultimoPedidoRegistrado', JSON.stringify(normalized));
    } catch (e) {
        console.warn('Não foi possível salvar ultimoPedidoRegistrado:', e);
    }

    // opcional: remover o pedidoAtual se quiser (aqui mantemos para exibição/backup)
    // localStorage.removeItem(PEDIDO_KEY);

    return resJson;
}

// ==============================
// Cookie helper
// ==============================
function getCookie(nome) {
    const cookies = document.cookie.split(';').map(c => c.trim());
    for (const cookie of cookies) {
        if (cookie.startsWith(nome + '=')) {
            return decodeURIComponent(cookie.substring(nome.length + 1));
        }
    }
    return null;
}
