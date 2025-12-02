document.addEventListener('DOMContentLoaded', () => {
    const tabela = document.querySelector('#tabelaProdutos tbody');
    const mesInput = document.getElementById('mes');
    const resumoDiv = document.getElementById('resumoVendas');

    const API_URL = 'http://localhost:3001/relatorio/produtos-mais-vendidos';

    async function carregarProdutos() {
        const params = new URLSearchParams();
        if (mesInput.value) params.set('mes', mesInput.value);

        try {
            const response = await fetch(`${API_URL}?${params.toString()}`);
            const produtos = await response.json();

            // Ordenar decrescente pela quantidade vendida
            produtos.sort((a, b) => b.quantidade - a.quantidade);

            tabela.innerHTML = '';
            let totalGeral = 0;

            produtos.forEach((p, index) => {
                const totalProduto = p.quantidade * parseFloat(p.valor_unitario);
                totalGeral += totalProduto;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${p.nome}</td>
                    <td>${p.quantidade}</td>
                    <td>${totalProduto.toFixed(2)}</td>
                `;
                tabela.appendChild(tr);
            });

            resumoDiv.innerHTML = `<p><strong>Total Geral das Vendas em determinado <br> mês ou de todas as vendas ja registradas:</strong> R$ ${totalGeral.toFixed(2)}</p>`;

        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
        }
    }

    document.getElementById('btnFiltrar').addEventListener('click', carregarProdutos);
    document.getElementById('btnLimpar').addEventListener('click', () => {
        mesInput.value = '';
        carregarProdutos();
    });

    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = '../../menu.html'; // Ajuste se necessário
    });

    carregarProdutos(); // carrega automaticamente ao abrir
});

// Função gerar PDF
function gerarPDF() {
    const tabela = document.getElementById('tabelaProdutos').outerHTML;
    const resumo = document.getElementById('resumoVendas').innerHTML;
    const titulo = '<h1>Produtos Mais Vendidos do Mês</h1>';

    // Obter data e hora atual
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');
    const dataHora = `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;

    // Estatísticas adicionais
    const produtosLinhas = Array.from(document.querySelectorAll('#tabelaProdutos tbody tr'));
    let valorTotalGeral = 0;
    let quantidadeTotalProdutos = 0;

    const produtosArray = produtosLinhas.map(tr => {
        const nome = tr.cells[1].textContent;
        const quantidade = parseInt(tr.cells[2].textContent);
        const valorTotal = parseFloat(tr.cells[3].textContent);

        valorTotalGeral += valorTotal;
        quantidadeTotalProdutos += quantidade;

        return { nome, quantidade, valorTotal };
    });

    const top3Produtos = produtosArray
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 3)
        .map((p, index, arr) => {
            return index < arr.length - 1 
                ? `${p.nome} (${p.quantidade} vendidos);`
                : `${p.nome} (${p.quantidade} vendidos).`;
        })
        .join('<br>');

    const mediaVenda = (valorTotalGeral / (produtosArray.length || 1)).toFixed(2);

    const estatisticas = `
        <section style="margin-top:20px;">
            <h2>Resumo Estatístico</h2>
            <p><strong>Data e Hora do Relatório:</strong> ${dataHora}</p>
            <p><strong>Valor Total de Vendas:</strong> R$ ${valorTotalGeral.toFixed(2)}</p>
            <p><strong>Quantidade Total de Produtos Vendidos:</strong> ${quantidadeTotalProdutos}</p>
            <p><strong>Média de Vendas por Produto:</strong> R$ ${mediaVenda}</p>
            <p><strong>Top 3 Produtos Mais Vendidos:</strong><br>${top3Produtos}</p>
            <br>
        </section>
    `;

    const estilo = `
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { text-align: center; margin-bottom: 15px; }
            p { font-size: 14px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: center; }
            th { background-color: #f0f0f0; }
        </style>
    `;

    const win = window.open('', '', 'width=1000,height=800');
    win.document.write('<html><head><title>Relatório</title>');
    win.document.write(estilo);
    win.document.write('</head><body>');
    win.document.write(titulo);
    win.document.write(estatisticas);
    win.document.write(tabela);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}
