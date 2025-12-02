const db = require('../database');

// Listar pagamentos
exports.listarPagamentos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Pagamento');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.criarPagamento = async (req, res, next) => {
  try {
    const { id_pessoa, id_forma_pagamento, status_pagamento = false, itens } = req.body;

    if (!id_pessoa || !id_forma_pagamento || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'id_pessoa, id_forma_pagamento e itens (array) são obrigatórios' });
    }

    // Transação: inserir pagamento, pedido e itens, calcular total e atualizar pedido
    const result = await req.db.transaction(async (client) => {
      // 1) Inserir Pagamento
      const pagamentoRes = await client.query(
        'INSERT INTO Pagamento (id_forma_pagamento, status_pagamento) VALUES ($1, $2) RETURNING id_pagamento',
        [id_forma_pagamento, status_pagamento]
      );
      const id_pagamento = pagamentoRes.rows[0].id_pagamento;

      // 2) Inserir Pedido
      const pedidoRes = await client.query(
        'INSERT INTO Pedido (id_pessoa, id_pagamento) VALUES ($1, $2) RETURNING id_pedido, data_pedido',
        [id_pessoa, id_pagamento]
      );
      const id_pedido = pedidoRes.rows[0].id_pedido;

      // 3) Inserir Item_Pedido(s)
      let valorTotal = 0;
      const itensInseridos = [];
      for (const it of itens) {
        const id_produto = it.id_produto;
        const quantidade = parseInt(it.quantidade, 10) || 0;
        const valor_unitario = parseFloat(it.preco_unitario) || 0;

        if (!id_produto || quantidade <= 0) continue;

        await client.query(
          'INSERT INTO Item_Pedido (id_pedido, id_produto, quantidade, valor_unitario) VALUES ($1, $2, $3, $4)',
          [id_pedido, id_produto, quantidade, valor_unitario]
        );

        itensInseridos.push({ id_produto, quantidade, valor_unitario });
        valorTotal += quantidade * valor_unitario;
      }

      // 4) Atualizar valor_total do pedido
      await client.query(
        'UPDATE Pedido SET valor_total = $1 WHERE id_pedido = $2',
        [valorTotal, id_pedido]
      );

      return {
        pagamento: { id_pagamento, id_forma_pagamento, status_pagamento },
        pedido: { id_pedido, id_pessoa, valor_total: valorTotal, data_pedido: pedidoRes.rows[0].data_pedido },
        itens: itensInseridos
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Erro criarPagamento:', error);
    return next(error);
  }
};

exports.atualizarStatusPagamento = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    let { status_pagamento } = req.body;

    // Normalizar diferentes formatos: boolean, string "true"/"false", number 1/0
    if (typeof status_pagamento === 'string') {
      status_pagamento = status_pagamento.toLowerCase() === 'true';
    } else if (typeof status_pagamento === 'number') {
      status_pagamento = status_pagamento === 1;
    }

    if (typeof status_pagamento !== 'boolean') {
      return res.status(400).json({ error: 'status_pagamento (boolean) é obrigatório no body' });
    }

    // usa req.db.transaction para garantir consistência caso queira estender
    const dbClient = req.db || require('../database');

    console.log(`Tentando atualizar pagamento ${id} para status_pagamento=${status_pagamento}`);

    const result = await dbClient.transaction(async (client) => {
      // Verifica existência do pagamento
      const exist = await client.query('SELECT id_pagamento, id_forma_pagamento, status_pagamento FROM Pagamento WHERE id_pagamento = $1', [id]);
      if (exist.rowCount === 0) {
        return { notFound: true };
      }

      const atual = exist.rows[0];
      // Se já estiver no mesmo estado, retorna sem erro
      if (actualizeBooleanEquals(atual.status_pagamento, status_pagamento)) {
        // Busca pedidos associados para retorno informativo
        const pedidosRes = await client.query('SELECT id_pedido, id_pessoa, valor_total, data_pedido FROM Pedido WHERE id_pagamento = $1', [id]);
        return { updated: false, pagamento: atual, pedidos: pedidosRes.rows };
      }

      // Atualiza pagamento
      const updateRes = await client.query(
        'UPDATE Pagamento SET status_pagamento = $1 WHERE id_pagamento = $2 RETURNING id_pagamento, id_forma_pagamento, status_pagamento',
        [status_pagamento, id]
      );

      // Busca pedido(s) associados (normalmente 1)
      const pedidosRes = await client.query('SELECT id_pedido, id_pessoa, valor_total, data_pedido FROM Pedido WHERE id_pagamento = $1', [id]);

      return { updated: true, pagamento: updateRes.rows[0], pedidos: pedidosRes.rows };
    });

    if (result.notFound) return res.status(404).json({ error: 'Pagamento não encontrado' });

    // Resposta clara para frontend
    return res.status(200).json({
      success: true,
      updated: result.updated || false,
      pagamento: result.pagamento,
      pedidos: result.pedidos
    });
  } catch (error) {
    console.error('Erro atualizarStatusPagamento:', error);
    return next(error);
  }
};

// Nova função: obter pagamento por id (útil para debug/testes)
exports.getPagamentoPorId = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const dbClient = req.db || db;
    const result = await dbClient.query('SELECT id_pagamento, id_forma_pagamento, status_pagamento FROM Pagamento WHERE id_pagamento = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro getPagamentoPorId:', error);
    return next(error);
  }
};

// helper local: compara booleanos/valores para evitar update desnecessário
function actualizeBooleanEquals(a, b) {
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b;
  // tenta normalizar booleans vindos do banco (p.ex. 't'/'f' em alguns casos) e do body
  const norm = (v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true' || v === 't' || v === '1';
    if (typeof v === 'number') return v === 1;
    return !!v;
  };
  return norm(a) === norm(b);
}
