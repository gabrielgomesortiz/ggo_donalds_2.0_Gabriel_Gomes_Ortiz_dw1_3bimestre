document.addEventListener('DOMContentLoaded', () => {

    const tabela = document.querySelector('#tabelaUsuarios tbody');
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');
    const minComprasInput = document.getElementById('minCompras');
    const maxComprasInput = document.getElementById('maxCompras');

    const API_URL = 'http://localhost:3001/relatorio/usuarios-mais-compraram';

    async function carregarUsuarios() {
        const params = new URLSearchParams();

        if (dataInicioInput.value.trim()) params.set('dataInicio', dataInicioInput.value);
        if (dataFimInput.value.trim()) params.set('dataFim', dataFimInput.value);
        if (minComprasInput.value.trim()) params.set('minCompras', minComprasInput.value);
        if (maxComprasInput.value.trim()) params.set('maxCompras', maxComprasInput.value);

        try {
            const response = await fetch(`${API_URL}?${params.toString()}`);
            const usuarios = await response.json();

            tabela.innerHTML = '';

            usuarios.forEach((u, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td>${u.total_pedidos}</td>
                    <td>${parseFloat(u.valor_total).toFixed(2)}</td>
                `;
                tabela.appendChild(tr);
            });

        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        }
    }

    document.getElementById('btnFiltrar').addEventListener('click', carregarUsuarios);
    document.getElementById('btnLimpar').addEventListener('click', () => {
        dataInicioInput.value = '';
        dataFimInput.value = '';
        minComprasInput.value = '';
        maxComprasInput.value = '';
        carregarUsuarios();
    });

    carregarUsuarios();
});

function gerarPDF() {
    const tabela = document.getElementById('tabelaUsuarios');
    const linhas = Array.from(tabela.querySelectorAll('tbody tr'));

    if (linhas.length === 0) {
        alert('Não há dados para gerar o relatório.');
        return;
    }

    // Totais e médias
    let totalPedidos = 0;
    let valorTotal = 0;
    linhas.forEach(linha => {
        totalPedidos += parseInt(linha.cells[3].textContent) || 0;
        valorTotal += parseFloat(linha.cells[4].textContent) || 0;
    });

    const mediaPedidos = (totalPedidos / linhas.length).toFixed(2);
    const mediaValor = (valorTotal / linhas.length).toFixed(2);
    const totalClientes = linhas.length;

    // Maior e menor comprador
    const maiorCompra = linhas.reduce((prev, curr) => 
        parseFloat(curr.cells[4].textContent) > parseFloat(prev.cells[4].textContent) ? curr : prev
    );
    const menorCompra = linhas.reduce((prev, curr) => 
        parseFloat(curr.cells[4].textContent) < parseFloat(prev.cells[4].textContent) ? curr : prev
    );

    // Período filtrado
    const dataInicio = document.getElementById('dataInicio').value || 'Início';
    const dataFim = document.getElementById('dataFim').value || 'Hoje';
    const periodo = `Período: ${dataInicio} até ${dataFim}`;

    // HTML do relatório
    const titulo = '<h1>Relatório de Usuários que Mais Compraram</h1>';
    const resumo = `
        <p><strong>${periodo}</strong></p>
        <p><strong>Total de Pedidos:</strong> ${totalPedidos} | <strong>Total Geral das Vendas:</strong> R$ ${valorTotal.toFixed(2)}</p>
        <p><strong>Média de Pedidos por Cliente:</strong> ${mediaPedidos} | <strong>Média de Valor por Pedido:</strong> R$ ${mediaValor}</p>
        <p><strong>Maior comprador:</strong> ${maiorCompra.cells[1].textContent} - R$ ${parseFloat(maiorCompra.cells[4].textContent).toFixed(2)}</p>
        <p><strong>Menor comprador:</strong> ${menorCompra.cells[1].textContent} - R$ ${parseFloat(menorCompra.cells[4].textContent).toFixed(2)}</p>
        <p><strong>Total de clientes listados:</strong> ${totalClientes}</p>
    `;
    const tabelaHTML = tabela.outerHTML;

    const estilo = `
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            p { font-size: 16px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: center; }
            th { background-color: #f0f0f0; }
        </style>
    `;

    // Abrir nova janela e imprimir
    const win = window.open('', '', 'width=900,height=700');
    win.document.write('<html><head><title>Relatório</title>');
    win.document.write(estilo);
    win.document.write('</head><body>');
    win.document.write(titulo);
    win.document.write(resumo);
    win.document.write(tabelaHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}
document.addEventListener('DOMContentLoaded', () => {
    const btnVoltar = document.getElementById('btnVoltar');
    btnVoltar.addEventListener('click', () => {
        // Redireciona para a página do menu
        window.location.href = '../../menu.html'; // ajuste o caminho se necessário
    });
});
