// pagamento.js
const PIX_CODE = '00020126360014BR.GOV.BCB.PIX0114+5561999999995204000053039865405100.005802BR5913NOME DO RECEBEDOR6009CIDADE62070503***6304ABCD';
const API_URL = 'http://localhost:3001';
const PEDIDO_KEY = 'pedidoAtual';
let qrcode;

document.addEventListener('DOMContentLoaded', () => {
    // ==============================
    // Checar usuário no cookie
    // ==============================
    const usuarioStr = getCookie("usuario");
    if (!usuarioStr) {
        alert("Faça login antes de pagar.");
        window.location.href = "../a-login/login.html";
        return;
    }

    const usuario = JSON.parse(usuarioStr);
    console.log("Usuário no pagamento:", usuario);

    const id_pessoa = usuario.id_pessoa;
    if (!id_pessoa) {
        alert("ID do usuário não encontrado!");
        throw new Error("Usuário inválido");
    }

    // ==============================
    // Inicializar tela
    // ==============================
    gerarQrCode();

    document.getElementById('pix')?.addEventListener('change', () => gerarQrCode());
    document.getElementById('btn_copiar_pix')?.addEventListener('click', async () => await pagar('pix', id_pessoa));
    document.getElementById('btn_pagar')?.addEventListener('click', async () => await pagar('cartao', id_pessoa));
});

function gerarQrCode() {
    const qrcodeElement = document.getElementById('qrcode');
    if (!qrcodeElement) return;

    qrcodeElement.innerHTML = '';
    qrcode = new QRCode(qrcodeElement, {
        text: PIX_CODE,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    const pixText = document.getElementById('pix_code_text');
    if (pixText) pixText.textContent = PIX_CODE;
}

async function registrarPedido(idCliente, idFormaPagamento, statusPagamento = false) {
    const pedidoAtual = JSON.parse(localStorage.getItem(PEDIDO_KEY));
    if (!pedidoAtual || !pedidoAtual.pedidos) throw new Error("Nenhum pedido encontrado.");

    const itens = [];
    const categorias = ['hamburgueres', 'acompanhamentos', 'bebidas'];
    for (const cat of categorias) {
        const arr = pedidoAtual.pedidos[cat] || [];
        for (const item of arr) {
            itens.push({
                id_produto: item.id,
                quantidade: item.quantidade,
                preco_unitario: item.precoUnitario ?? item.preco
            });
        }
    }

    const res = await fetch(`${API_URL}/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_pessoa: idCliente,
            id_forma_pagamento: idFormaPagamento,
            status_pagamento: statusPagamento, // agora permite false (pendente)
            itens
        })
    });

    if (!res.ok) throw new Error(await res.text());

    const resJson = await res.json();

    // Guardar resposta do servidor (útil para future updates/consulta)
    try {
        localStorage.setItem('ultimoPedidoRegistrado', JSON.stringify(resJson));
    } catch (e) {
        console.warn('Não foi possível salvar ultimoPedidoRegistrado:', e);
    }

    // Remover carrinho local
    localStorage.removeItem(PEDIDO_KEY);

    return resJson;
}

// helper: ler último pedido registrado (criado na tela /a-conta)
// agora tolerante a vários formatos e garante retorno com pagamento.id_pagamento quando possível
function getUltimoPedidoRegistrado() {
    try {
        const raw = localStorage.getItem('ultimoPedidoRegistrado');
        if (!raw) return null;
        const obj = JSON.parse(raw);

        // Possíveis formatos: { pagamento: { id_pagamento: ... }, pedido: ..., itens: [...] }
        if (obj && obj.pagamento && (obj.pagamento.id_pagamento || obj.pagamento.id_pagamento === 0)) {
            return obj;
        }

        // Caso backend tenha retornado diretamente { pagamento: {...}, pedido: {...} } ou apenas { id_pagamento: ... }
        if (obj && obj.id_pagamento) {
            return { pagamento: { id_pagamento: obj.id_pagamento }, pedido: obj, itens: [] };
        }

        // Tentar varrer objetos aninhados para achar id_pagamento
        if (obj && obj.pagamento && (obj.pagamento.id || obj.pagamento.id_pagamento)) {
            return { pagamento: { id_pagamento: obj.pagamento.id_pagamento || obj.pagamento.id }, pedido: obj.pedido || {}, itens: obj.itens || [] };
        }

        return obj; // fallback
    } catch (e) {
        console.warn('Erro ao parse ultimoPedidoRegistrado', e);
        return null;
    }
}

// Nova versão de confirmarPagamento com tratamento detalhado de erros e logs
async function confirmarPagamento(idPagamento) {
    if (!idPagamento) throw new Error('idPagamento é necessário para confirmar pagamento.');

    console.log('Chamando PATCH /pagamento/' + idPagamento + ' para setar status_pagamento = true');

    let res;
    try {
        res = await fetch(`${API_URL}/pagamento/${idPagamento}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_pagamento: true })
        });
    } catch (networkErr) {
        console.error('Erro de rede ao confirmar pagamento:', networkErr);
        throw new Error('Erro de rede ao confirmar pagamento. Verifique conexão com o servidor.');
    }

    // Log da resposta para depuração
    console.log('Resposta PATCH status:', res.status, 'ok:', res.ok);

    // Tentar extrair JSON com mensagem, se possível
    let payload;
    try {
        payload = await res.json();
    } catch (e) {
        // Se não for JSON, tentar texto
        try {
            const txt = await res.text();
            payload = { text: txt };
        } catch (_) {
            payload = null;
        }
    }

    if (!res.ok) {
        console.error('Erro do servidor ao confirmar pagamento:', payload);
        const msg = (payload && (payload.error || payload.message || payload.text)) ? (payload.error || payload.message || payload.text) : `Status ${res.status}`;
        throw new Error('Erro do servidor: ' + msg);
    }

    console.log('Pagamento confirmado:', payload);
    return payload;
}

async function pagar(metodo, idCliente) {
    if (!idCliente) {
        alert("Usuário inválido. Faça login novamente.");
        window.location.href = "../a-login/login.html";
        return;
    }

    // se houver pedido pendente criado pela conta, aprova esse pagamento em vez de criar novo
    const ultimo = getUltimoPedidoRegistrado();
    const idPagamentoExistente = ultimo?.pagamento?.id_pagamento || ultimo?.pagamento?.id;

    if (metodo === 'cartao') {
        const cpf = document.getElementById('input_cpf')?.value;
        const endereco = document.getElementById('input_endereco')?.value;
        const numCartao = document.getElementById('input_cartao_num')?.value;

        if (!cpf || !endereco || !numCartao) { alert("Preencha todos os campos do cartão!"); return; }
        if (!validarCPF(cpf)) { alert("CPF inválido!"); return; }
        if (!validarCartao(numCartao)) { alert("Número de cartão inválido!"); return; }

        try {
            if (idPagamentoExistente) {
                await confirmarPagamento(idPagamentoExistente);
                localStorage.removeItem('ultimoPedidoRegistrado');
                localStorage.removeItem(PEDIDO_KEY);
                alert("Pagamento confirmado (pedido pendente aprovado).");
            } else {
                await registrarPedido(idCliente, 1, true);
                alert("Pagamento via cartão registrado com sucesso!");
            }
            window.location.href = '../index.html';
        } catch (err) {
            console.error('Erro ao confirmar/registrar pagamento (cartão):', err);
            alert('Erro ao confirmar/registrar pagamento: ' + (err.message || 'erro desconhecido'));
        }

    } else if (metodo === 'pix') {
        try {
            if (idPagamentoExistente) {
                await confirmarPagamento(idPagamentoExistente);
                // copiar PIX após confirmação
                try { await navigator.clipboard.writeText(PIX_CODE); } catch(_) { /* ignore */ }
                localStorage.removeItem('ultimoPedidoRegistrado');
                localStorage.removeItem(PEDIDO_KEY);
                alert("Código PIX copiado. Pagamento confirmado (pedido pendente aprovado).");
            } else {
                await registrarPedido(idCliente, 2, true);
                try { await navigator.clipboard.writeText(PIX_CODE); } catch(_) { /* ignore */ }
                alert("Código PIX copiado e pagamento registrado com sucesso!");
            }
            window.location.href = '../index.html';
        } catch (err) {
            console.error('Erro ao confirmar/registrar pagamento (PIX):', err);
            alert('Erro ao confirmar/registrar pagamento PIX: ' + (err.message || 'erro desconhecido'));
        }
    } else {
        alert("Selecione um método de pagamento!");
    }
}

// ==============================
// Funções auxiliares
// ==============================
function getCookie(nome) {
    const valor = `; ${document.cookie}`;
    const partes = valor.split(`; ${nome}=`);
    if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
    return null;
}

function validarCPF(cpf) {
    const strCPF = cpf.replace(/\D/g, '');
    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(strCPF[i]) * (10 - i);
    const digito1 = (soma % 11 < 2) ? 0 : 11 - (soma % 11);
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(strCPF[i]) * (11 - i);
    const digito2 = (soma % 11 < 2) ? 0 : 11 - (soma % 11);
    return parseInt(strCPF[9]) === digito1 && parseInt(strCPF[10]) === digito2;
}

function validarCartao(numeroCartao) {
    const numeroLimpo = numeroCartao.replace(/\D/g, '');
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) return false;
    let soma = 0, deveDobrar = false;
    for (let i = numeroLimpo.length - 1; i >= 0; i--) {
        let digito = parseInt(numeroLimpo[i]);
        if (deveDobrar) { digito *= 2; if (digito > 9) digito -= 9; }
        soma += digito;
        deveDobrar = !deveDobrar;
    }
    return soma % 10 === 0;
}
