const db = require('../database.js');
const path = require('path');
const fs = require('fs');

// =======================================================
// FUNÇÃO AUXILIAR PARA REMOVER IMAGEM ANTIGA
// =======================================================
function removerImagemAntiga(id, pastaImgs) {
    if (!fs.existsSync(pastaImgs)) return;
    fs.readdirSync(pastaImgs).forEach(f => {
        if (f.startsWith(`${id}.`)) {
            try { fs.unlinkSync(path.join(pastaImgs, f)); }
            catch (e) { console.warn('Falha ao remover imagem antiga:', e); }
        }
    });
}

// =======================================================
// LISTAR PRODUTOS
// =======================================================
exports.listarProdutos = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.*, c.nome_categoria
             FROM Produto p
             JOIN Categoria c ON p.id_categoria = c.id_categoria
             ORDER BY p.id_produto`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar produtos:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// =======================================================
// CRIAR PRODUTO
// =======================================================
exports.criarProduto = async (req, res) => {
    try {
        const { nome, id_categoria, quantidade_estoque, data_fabricacao, preco } = req.body;

        // Cria produto sem imagem
        const result = await db.query(
            `INSERT INTO Produto (nome, id_categoria, quantidade_estoque, data_fabricacao, preco)
             VALUES ($1,$2,$3,$4,$5)
             RETURNING *`,
            [nome, id_categoria, quantidade_estoque, data_fabricacao, preco]
        );

        const produto = result.rows[0];
        let caminho_imagem = null;

        // Se veio imagem
        if (req.file) {
            const ext = path.extname(req.file.originalname) || '.jpeg';
            const novoNome = `${produto.id_produto}${ext}`;
            const pastaImgs = path.join(__dirname, '../../frontend/imgs');
            if (!fs.existsSync(pastaImgs)) fs.mkdirSync(pastaImgs, { recursive: true });
            const novoCaminho = path.join(pastaImgs, novoNome);

            // Remove imagens antigas do mesmo ID
            removerImagemAntiga(produto.id_produto, pastaImgs);

            // Move ou copia a nova imagem
            try { fs.renameSync(req.file.path, novoCaminho); }
            catch { fs.copyFileSync(req.file.path, novoCaminho); fs.unlinkSync(req.file.path); }

            caminho_imagem = `imgs/${novoNome}`;
            await db.query(`UPDATE Produto SET caminho_imagem=$1 WHERE id_produto=$2`, [caminho_imagem, produto.id_produto]);
            produto.caminho_imagem = caminho_imagem;
        }

        res.status(201).json(produto);

    } catch (err) {
        console.error('Erro ao criar produto:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// =======================================================
// ATUALIZAR PRODUTO
// =======================================================
exports.atualizarProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const produtoExistente = await db.query(`SELECT * FROM Produto WHERE id_produto=$1`, [id]);
        if (produtoExistente.rows.length === 0)
            return res.status(404).json({ error: "Produto não encontrado" });

        const dados = produtoExistente.rows[0];
        const nome = req.body.nome ?? dados.nome;
        const preco = req.body.preco ? parseFloat(req.body.preco) : dados.preco;
        const quantidade_estoque = req.body.quantidade_estoque ? parseInt(req.body.quantidade_estoque) : dados.quantidade_estoque;
        const data_fabricacao = req.body.data_fabricacao || dados.data_fabricacao;
        const id_categoria = req.body.id_categoria ? parseInt(req.body.id_categoria) : dados.id_categoria;

        let caminho_imagem = dados.caminho_imagem;

        if (req.file) {
            const ext = path.extname(req.file.originalname) || '.jpeg';
            const novoNome = `${id}${ext}`;
            const pastaImgs = path.join(__dirname, '../../frontend/imgs');
            if (!fs.existsSync(pastaImgs)) fs.mkdirSync(pastaImgs, { recursive: true });
            const novoCaminho = path.join(pastaImgs, novoNome);

            // Remove imagens antigas
            removerImagemAntiga(id, pastaImgs);

            try { fs.renameSync(req.file.path, novoCaminho); }
            catch { fs.copyFileSync(req.file.path, novoCaminho); fs.unlinkSync(req.file.path); }

            caminho_imagem = `imgs/${novoNome}`;
        }

        const result = await db.query(
            `UPDATE Produto
             SET nome=$1, preco=$2, quantidade_estoque=$3,
                 data_fabricacao=$4, id_categoria=$5, caminho_imagem=$6
             WHERE id_produto=$7
             RETURNING *`,
            [nome, preco, quantidade_estoque, data_fabricacao, id_categoria, caminho_imagem, id]
        );

        res.json({ message: "Produto atualizado com sucesso!", produto: result.rows[0] });

    } catch (err) {
        console.error('Erro ao atualizar produto:', err);
        res.status(500).json({ error: "Erro ao atualizar produto" });
    }
};

// =======================================================
// OBTER PRODUTO POR ID
// =======================================================
exports.obterProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db.query(`SELECT * FROM Produto WHERE id_produto = $1`, [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao obter produto:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// =======================================================
// DELETAR PRODUTO
// =======================================================
exports.deletarProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const produto = await db.query(`SELECT * FROM Produto WHERE id_produto=$1`, [id]);
        if (produto.rows.length > 0 && produto.rows[0].caminho_imagem) {
            removerImagemAntiga(id, path.join(__dirname, '../../frontend/imgs'));
        }
        await db.query(`DELETE FROM Produto WHERE id_produto=$1`, [id]);
        res.json({ status: 'Produto deletado' });
    } catch (err) {
        console.error('Erro ao deletar produto:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// =======================================================
// UPLOAD DE IMAGEM
// =======================================================
exports.uploadImagemById = async (req, res) => {
    try {
        const produtoId = req.params.id;

        if (!req.file)
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });

        // busca produto
        const prod = await db.query('SELECT caminho_imagem FROM Produto WHERE id_produto=$1', [produtoId]);
        if (prod.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

        const antigoCaminhoBanco = prod.rows[0].caminho_imagem;
        const ext = path.extname(req.file.originalname) || '.jpeg';
        const novoNome = `${produtoId}${ext}`;
        const novoCaminho = path.join(__dirname, '../../frontend/imgs', novoNome);

        // Remove antiga imagem se existir e for diferente do novo caminho
        if (antigoCaminhoBanco) {
            const antigoCaminho = path.join(__dirname, '../../frontend/imgs', path.basename(antigoCaminhoBanco));
            if (fs.existsSync(antigoCaminho) && path.resolve(antigoCaminho) !== path.resolve(novoCaminho)) {
                try { fs.unlinkSync(antigoCaminho); } catch (e) { console.warn('Falha ao remover imagem antiga:', e); }
            }
        }

        // Com Multer, o arquivo já está no destino correto. Não precisa copiar/renomear.
        // Apenas atualizamos o caminho no banco
        const caminhoImagem = `imgs/${novoNome}`;
        const result = await db.query(
            'UPDATE Produto SET caminho_imagem=$1 WHERE id_produto=$2 RETURNING *',
            [caminhoImagem, produtoId]
        );

        res.json({
            message: 'Imagem enviada com sucesso!',
            produto: result.rows[0],
            caminho_imagem: caminhoImagem
        });

    } catch (err) {
        console.error('Erro no upload de imagem por ID:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
