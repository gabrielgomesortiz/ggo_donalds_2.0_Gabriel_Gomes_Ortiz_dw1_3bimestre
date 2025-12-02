const db = require('../database');

const getUsuariosMaisCompraram = async (req, res) => {
    try {
        const { dataInicio, dataFim, minCompras, maxCompras } = req.query;

        let filtros = ['pg.status_pagamento = true'];
        let valores = [];

        if (dataInicio) {
            valores.push(dataInicio);
            filtros.push(`p.data_pedido >= $${valores.length}`);
        }
        if (dataFim) {
            valores.push(dataFim);
            filtros.push(`p.data_pedido <= $${valores.length}`);
        }

        const whereClause = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

        const query = `
            WITH pedidos_filtrados AS (
                SELECT
                    p.id_pedido,
                    p.id_pessoa
                FROM Pedido p
                INNER JOIN Pagamento pg ON p.id_pagamento = pg.id_pagamento
                ${whereClause}
            ),
            valores_pedidos AS (
                SELECT
                    pf.id_pedido,
                    SUM(ip.quantidade * ip.valor_unitario) AS valor_total_pedido
                FROM pedidos_filtrados pf
                LEFT JOIN Item_Pedido ip ON pf.id_pedido = ip.id_pedido
                GROUP BY pf.id_pedido
            )
            SELECT
                pe.id_pessoa,
                pe.nome,
                pe.email,
                COUNT(pf.id_pedido) AS total_pedidos,
                COALESCE(SUM(vp.valor_total_pedido), 0) AS valor_total
            FROM Pessoa pe
            LEFT JOIN pedidos_filtrados pf ON pe.id_pessoa = pf.id_pessoa
            LEFT JOIN valores_pedidos vp ON pf.id_pedido = vp.id_pedido
            GROUP BY pe.id_pessoa
            HAVING COUNT(pf.id_pedido) > 0
            ${minCompras ? `AND COUNT(pf.id_pedido) >= ${parseInt(minCompras)}` : ''}
            ${maxCompras ? `AND COUNT(pf.id_pedido) <= ${parseInt(maxCompras)}` : ''}
            ORDER BY total_pedidos DESC, valor_total DESC;
        `;

        const { rows } = await db.query(query, valores);
        res.json(rows);

    } catch (error) {
        console.error('Erro ao buscar usuários que mais compraram:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários que mais compraram', message: error.message });
    }
};

const getProdutosMaisVendidos = async (req, res) => {
    try {
        const { mes } = req.query; // formato esperado: YYYY-MM

        let filtros = ['pg.status_pagamento = true'];
        let valores = [];

        if (mes) {
            const [ano, mesNum] = mes.split('-');
            valores.push(`${ano}-${mesNum}-01`);
            valores.push(`${ano}-${mesNum}-31`);
            filtros.push(`p.data_pedido BETWEEN $${valores.length - 1} AND $${valores.length}`);
        }

        const whereClause = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

        const query = `
            SELECT
                pr.id_produto,
                pr.nome,
                SUM(ip.quantidade) AS quantidade,
                ip.valor_unitario
            FROM Item_Pedido ip
            INNER JOIN Pedido p ON ip.id_pedido = p.id_pedido
            INNER JOIN Pagamento pg ON p.id_pagamento = pg.id_pagamento
            INNER JOIN Produto pr ON ip.id_produto = pr.id_produto
            ${whereClause}
            GROUP BY pr.id_produto, pr.nome, ip.valor_unitario
            ORDER BY quantidade DESC;
        `;

        const { rows } = await db.query(query, valores);
        res.json(rows);

    } catch (error) {
        console.error('Erro ao buscar produtos mais vendidos:', error);
        res.status(500).json({
            error: 'Erro ao buscar produtos mais vendidos',
            message: error.message
        });
    }
};

// Exportando as duas funções juntas
module.exports = { getUsuariosMaisCompraram, getProdutosMaisVendidos };
