// backend/controllers/funcionarioController.js
const db = require('../database'); // seu módulo de conexão com PostgreSQL

// Listar todos os funcionários (JOIN para trazer nome da pessoa e nome do cargo)
const getAllFuncionarios = async (req, res) => {
  try {
    const sql = `
      SELECT f.*, p.nome AS nome_pessoa, c.nome_cargo
      FROM Funcionario f
      LEFT JOIN Pessoa p ON f.id_pessoa = p.id_pessoa
      LEFT JOIN Cargo c ON f.id_cargo = c.id_cargo
      ORDER BY f.id_funcionario
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
};

// Buscar funcionário por ID (JOIN)
const getFuncionarioById = async (req, res) => {
  const id = req.params.id;
  try {
    const sql = `
      SELECT f.*, p.nome AS nome_pessoa, c.nome_cargo
      FROM Funcionario f
      LEFT JOIN Pessoa p ON f.id_pessoa = p.id_pessoa
      LEFT JOIN Cargo c ON f.id_cargo = c.id_cargo
      WHERE f.id_funcionario = $1
    `;
    const result = await db.query(sql, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
};

// Criar funcionário (id_pessoa é obrigatório)
const createFuncionario = async (req, res) => {
  // Normalizar/validar entrada (tratar 'null', '', string, etc)
  let { data_inicio, salario, id_cargo, id_pessoa } = req.body;

  // Log curto para depuração do payload
  const originalPayload = { id_pessoa, id_cargo, salario, data_inicio };
  console.log('createFuncionario payload:', originalPayload);

  // normalizar id_pessoa
  const idPessoaNum = id_pessoa === null || id_pessoa === undefined || id_pessoa === '' ? null : Number(id_pessoa);
  if (!Number.isInteger(idPessoaNum) || idPessoaNum <= 0) {
    return res.status(400).json({ error: 'id_pessoa inválido. Deve ser um inteiro positivo que exista na tabela Pessoa.', payload: originalPayload });
  }

  // validar id_cargo se fornecido
  const idCargoNum = id_cargo === null || id_cargo === undefined || id_cargo === '' ? null : Number(id_cargo);
  if (idCargoNum !== null && (!Number.isInteger(idCargoNum) || idCargoNum <= 0)) {
    return res.status(400).json({ error: 'id_cargo inválido. Deve ser inteiro positivo.', payload: originalPayload });
  }

  // validar salario (opcional dependendo das regras)
  const salarioNum = salario === null || salario === undefined || salario === '' ? null : Number(salario);
  if (salarioNum !== null && Number.isNaN(salarioNum)) {
    return res.status(400).json({ error: 'salario inválido.', payload: originalPayload });
  }

  try {
    // Valida se a pessoa existe
    const pessoaExist = await db.query('SELECT 1 FROM Pessoa WHERE id_pessoa = $1', [idPessoaNum]);
    if (pessoaExist.rowCount === 0) {
      return res.status(400).json({ error: `Pessoa com id_pessoa=${idPessoaNum} não encontrada`, payload: originalPayload });
    }

    // Valida se a pessoa já é funcionário — impede duplicidade (constraint UNIQUE)
    const jaFuncionario = await db.query('SELECT id_funcionario FROM Funcionario WHERE id_pessoa = $1', [idPessoaNum]);
    if (jaFuncionario.rowCount > 0) {
      return res.status(400).json({ error: `Pessoa id_pessoa=${idPessoaNum} já é funcionário (id_funcionario=${jaFuncionario.rows[0].id_funcionario})`, payload: originalPayload });
    }

    const result = await db.query(
      'INSERT INTO Funcionario (id_pessoa, id_cargo, salario, data_inicio) VALUES ($1, $2, $3, $4) RETURNING *',
      [idPessoaNum, idCargoNum, salarioNum, data_inicio || null]
    );

    // retornar com nomes (fazer JOIN simples para consistência)
    const id = result.rows[0].id_funcionario;
    const res2 = await db.query(`
      SELECT f.*, p.nome AS nome_pessoa, c.nome_cargo
      FROM Funcionario f
      LEFT JOIN Pessoa p ON f.id_pessoa = p.id_pessoa
      LEFT JOIN Cargo c ON f.id_cargo = c.id_cargo
      WHERE f.id_funcionario = $1
    `, [id]);
    return res.status(201).json(res2.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error, 'payload:', originalPayload);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Violação de unicidade ao criar funcionário (provavelmente id_pessoa já vinculado)', detail: error.detail || null, payload: originalPayload });
    }
    return res.status(500).json({ error: 'Erro ao criar funcionário', payload: originalPayload });
  }
};

// Atualizar funcionário (aceita mudar apenas data_inicio, salario e id_cargo)
const updateFuncionario = async (req, res) => {
  const id = req.params.id;
  const { data_inicio, salario, id_cargo, id_pessoa } = req.body;

  try {
    // Não permitir alteração do id_pessoa via endpoint
    if (req.body.hasOwnProperty('id_pessoa')) {
      return res.status(400).json({ error: 'Não é permitido alterar id_pessoa de um funcionário' });
    }

    // construir query apenas com campos permitidos
    const fields = [];
    const params = [];
    let idx = 1;
    if (data_inicio !== undefined) { fields.push(`data_inicio=$${idx++}`); params.push(data_inicio); }
    if (salario !== undefined) { fields.push(`salario=$${idx++}`); params.push(salario); }
    if (id_cargo !== undefined) { fields.push(`id_cargo=$${idx++}`); params.push(id_cargo); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo válido para atualizar (somente data_inicio, salario, id_cargo)' });

    params.push(id);
    const sql = `UPDATE Funcionario SET ${fields.join(', ')} WHERE id_funcionario=$${idx} RETURNING *`;
    const result = await db.query(sql, params);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });

    // retornar com nomes atualizados
    const res2 = await db.query(`
      SELECT f.*, p.nome AS nome_pessoa, c.nome_cargo
      FROM Funcionario f
      LEFT JOIN Pessoa p ON f.id_pessoa = p.id_pessoa
      LEFT JOIN Cargo c ON f.id_cargo = c.id_cargo
      WHERE f.id_funcionario = $1
    `, [id]);

    res.json(res2.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
};

// Excluir funcionário
const deleteFuncionario = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM Funcionario WHERE id_funcionario = $1', [id]);
    res.json({ message: 'Funcionário excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir funcionário' });
  }
};

module.exports = {
  getAllFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario
};
