const express = require('express');
const router = express.Router();

// Apenas uma declaração, sem duplicata
const relatorioController = require('../controllers/relatorioController');

router.get('/usuarios-mais-compraram', relatorioController.getUsuariosMaisCompraram);
router.get('/produtos-mais-vendidos', relatorioController.getProdutosMaisVendidos);

module.exports = router;
