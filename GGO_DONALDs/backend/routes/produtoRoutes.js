const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// =======================================================
// Caminho para salvar imagens
// =======================================================
const pastaImgs = path.join(__dirname, '../../frontend/imgs');

// cria a pasta se não existir
if (!fs.existsSync(pastaImgs)) {
    fs.mkdirSync(pastaImgs, { recursive: true });
}

// =======================================================
// Configuração do Multer
// =======================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pastaImgs),
    filename: (req, file, cb) => {
        const id = req.params.id || req.body.produtoId || Date.now();
        const ext = path.extname(file.originalname) || '.jpeg';
        cb(null, `${id}${ext}`);
    }
});

const upload = multer({ storage });

// =======================================================
// Rotas CRUD Produto
// =======================================================
router.get('/', produtoController.listarProdutos);         // Listar todos
router.get('/:id', produtoController.obterProduto);        // Obter por ID
router.post('/', produtoController.criarProduto);          // Criar produto (sem imagem)
router.put('/:id', produtoController.atualizarProduto);    // Atualizar produto (opcional imagem)
router.delete('/:id', produtoController.deletarProduto);   // Deletar produto

// =======================================================
// Upload de imagem por ID
// =======================================================
router.post('/:id/imagem', upload.single('imagem'), produtoController.uploadImagemById);

module.exports = router;
