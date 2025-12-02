const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// Criar pagamento + pedido + itens (status_pagamento pode ser false ou true)
router.post('/', pagamentoController.criarPagamento);

// Atualizar status do pagamento (aprovar)
router.patch('/:id', pagamentoController.atualizarStatusPagamento);

// opcional: listar pagamentos
router.get('/', pagamentoController.listarPagamentos);

module.exports = router;
