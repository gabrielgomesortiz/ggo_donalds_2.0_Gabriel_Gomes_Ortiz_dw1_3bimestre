-- -------------------------
-- INSERÇÕES DE CATEGORIA
-- -------------------------
INSERT INTO Categoria (nome_categoria) VALUES
('acompanhamento'),
('bebida'),
('hamburguer');

-- -------------------------
-- INSERÇÕES DE PRODUTO
-- -------------------------
INSERT INTO Produto (nome, id_categoria, caminho_imagem, quantidade_estoque, data_fabricacao, preco) VALUES
('GGOsFritas Cheddar Bacon', 1, 'imgs/1.jpeg', 50, '2023-08-01', 15.90),
('GGOsFritas Grande', 1, 'imgs/2.jpeg', 50, '2023-08-01', 12.90),
('GGOsFritas Média', 1, 'imgs/3.jpeg', 50, '2023-08-01', 10.90),
('GGOsFritas Pequena', 1, 'imgs/4.jpeg', 50, '2023-08-01', 7.90),
('GGOsFritas Kids', 1, 'imgs/5.jpeg', 50, '2023-08-01', 5.90),
('Chicken GGOsNuggets 4 unidades', 1, 'imgs/6.jpeg', 50, '2023-08-01', 9.90),
('Chicken GGOsNuggets 10 unidades', 1, 'imgs/7.jpeg', 50, '2023-08-01', 22.90),
('Chicken GGOsNuggets 6 unidades', 1, 'imgs/8.jpeg', 50, '2023-08-01', 15.90),
('Ketchup', 1, 'imgs/9.jpeg', 50, '2023-08-01', 1.50),
('Mostarda', 1, 'imgs/10.jpeg', 50, '2023-08-01', 1.50),
('Chicken GGOsNuggets 15 unidades', 1, 'imgs/11.jpeg', 50, '2023-08-01', 29.90),
('Molho Barbecue', 1, 'imgs/12.jpeg', 50, '2023-08-01', 2.50),
('Molho Ranch', 1, 'imgs/13.jpeg', 50, '2023-08-01', 2.50),
('Coca-Cola 300ml', 2, 'imgs/14.jpeg', 100, '2023-08-01', 6.90),
('Coca-Cola 500ml', 2, 'imgs/15.jpeg', 100, '2023-08-01', 8.90),
('Coca-Cola 700ml', 2, 'imgs/16.jpeg', 100, '2023-08-01', 10.90),
('Coca-Cola Zero 300ml', 2, 'imgs/17.jpeg', 100, '2023-08-01', 6.90),
('Coca-Cola Zero 500ml', 2, 'imgs/18.jpeg', 100, '2023-08-01', 8.90),
('Coca-Cola Zero 700ml', 2, 'imgs/19.jpeg', 100, '2023-08-01', 10.90),
('Fanta Laranja 300ml', 2, 'imgs/20.jpeg', 100, '2023-08-01', 6.50),
('Fanta Laranja 500ml', 2, 'imgs/21.jpeg', 100, '2023-08-01', 8.50),
('Fanta Laranja 700ml', 2, 'imgs/22.jpeg', 100, '2023-08-01', 10.50),
('Fanta Guaraná 300ml', 2, 'imgs/23.jpeg', 100, '2023-08-01', 6.50),
('Fanta Guaraná 500ml', 2, 'imgs/24.jpeg', 100, '2023-08-01', 8.50),
('Fanta Guaraná 700ml', 2, 'imgs/25.jpeg', 100, '2023-08-01', 10.50),
('Del Valle Laranja 300ml', 2, 'imgs/26.jpeg', 100, '2023-08-01', 7.90),
('Del Valle Laranja 500ml', 2, 'imgs/27.jpeg', 100, '2023-08-01', 9.90),
('Del Valle Laranja 700ml', 2, 'imgs/28.jpeg', 100, '2023-08-01', 11.90),
('Del Valle Uva 300ml', 2, 'imgs/29.jpeg', 100, '2023-08-01', 7.90),
('Del Valle Uva 500ml', 2, 'imgs/30.jpeg', 100, '2023-08-01', 9.90),
('Del Valle Uva 700ml', 2, 'imgs/31.jpeg', 100, '2023-08-01', 11.90),
('Água Mineral', 2, 'imgs/32.jpeg', 100, '2023-08-01', 4.50),
('Del Valle 100% Uva (GGOsLanche Feliz)', 2, 'imgs/33.jpeg', 100, '2023-08-01', 9.50),
('Café Premium 100ml', 2, 'imgs/34.jpeg', 100, '2023-08-01', 5.90),
('Café Premium 200ml', 2, 'imgs/35.jpeg', 100, '2023-08-01', 7.50),
('Café Premium 300ml', 2, 'imgs/36.jpeg', 100, '2023-08-01', 8.90),
('Café com Leite 200ml', 2, 'imgs/37.jpeg', 100, '2023-08-01', 6.90),
('Café com Leite 300ml', 2, 'imgs/38.jpeg', 100, '2023-08-01', 8.20),
('Capuccino 200ml', 2, 'imgs/39.jpeg', 100, '2023-08-01', 9.50),
('Capuccino 300ml', 2, 'imgs/40.jpeg', 100, '2023-08-01', 11.00),
('Chocolate Quente 200ml', 2, 'imgs/41.jpeg', 100, '2023-08-01', 8.50),
('Chocolate Quente 300ml', 2, 'imgs/42.jpeg', 100, '2023-08-01', 10.50),
('Super Cheddar GGOsMelt Bacon', 3, 'imgs/43.jpeg', 30, '2023-08-01', 35.90),
('Big GGOs Clássico', 3, 'imgs/44.jpeg', 30, '2023-08-01', 32.50),
('Big GGOs Especial', 3, 'imgs/45.jpeg', 30, '2023-08-01', 32.50),
('Duplo Quarterão Tradicional', 3, 'imgs/46.jpeg', 30, '2023-08-01', 34.90),
('Duplo Quarterão Bacon', 3, 'imgs/47.jpeg', 30, '2023-08-01', 34.90),
('Quarterão com Queijo Simples', 3, 'imgs/48.jpeg', 30, '2023-08-01', 28.75),
('Quarterão com Queijo Duplo', 3, 'imgs/49.jpeg', 30, '2023-08-01', 28.75),
('GGOsNífico Bacon Original', 3, 'imgs/50.jpeg', 30, '2023-08-01', 31.20),
('GGOsNífico Bacon Extra', 3, 'imgs/51.jpeg', 30, '2023-08-01', 31.20),
('Duplo Cheddar GGOsMelt Clássico', 3, 'imgs/52.jpeg', 30, '2023-08-01', 33.80),
('Duplo Cheddar GGOsMelt Supreme', 3, 'imgs/53.jpeg', 30, '2023-08-01', 33.80),
('Cheddar GGOsMelt Tradicional', 3, 'imgs/54.jpeg', 30, '2023-08-01', 27.60),
('Cheddar GGOsMelt Deluxe', 3, 'imgs/55.jpeg', 30, '2023-08-01', 27.60),
('Duplo Burger Bacon Clássico', 3, 'imgs/56.jpeg', 30, '2023-08-01', 37.90),
('Duplo Burger Bacon Supreme', 3, 'imgs/57.jpeg', 30, '2023-08-01', 37.90),
('Duplo Burger com Queijo Clássico', 3, 'imgs/58.jpeg', 30, '2023-08-01', 36.50),
('Duplo Burger com Queijo Especial', 3, 'imgs/59.jpeg', 30, '2023-08-01', 37.59);

-- -------------------------
-- INSERÇÕES DE CARGO
-- -------------------------
INSERT INTO Cargo (nome_cargo) VALUES
('Faxineiro'), -- id_cargo 1
('adm'),       -- id_cargo 2
('Chefe');     -- id_cargo 3

-- -------------------------
-- INSERÇÕES DE PESSOA
-- -------------------------
INSERT INTO Pessoa (nome, email, senha) VALUES
('Cliente 1', 'cliente1@email.com', 'senha123'), -- id_pessoa 1
('Cliente 2', 'cliente2@email.com', 'senha123'), -- id_pessoa 2
('Cliente 3', 'cliente3@email.com', 'senha123'), -- id_pessoa 3
('Cliente 4', 'cliente4@email.com', 'senha123'), -- id_pessoa 4
('Funcionario 1', 'func1@email.com', 'senha123'), -- id_pessoa 5
('Funcionario 2', 'func2@email.com', 'senha123'), -- id_pessoa 6
('Funcionario 3', 'func3@email.com', 'senha123'); -- id_pessoa 7

-- -------------------------
-- INSERÇÕES DE FUNCIONARIO
-- -------------------------
INSERT INTO Funcionario (id_pessoa, id_cargo, salario, data_inicio) VALUES
(5, 1, 1500.00, '2023-08-01'), -- id_funcionario 1 (Pessoa 5)
(6, 2, 5000.00, '2023-08-01'), -- id_funcionario 2 (Pessoa 6)
(7, 3, 10000.00, '2023-08-01'); -- id_funcionario 3 (Pessoa 7)

-- -------------------------
-- INSERÇÕES DE FORMA_PAGAMENTO
-- -------------------------
INSERT INTO Forma_Pagamento (nome_forma_pagamento) VALUES
('Cartão'), -- id_forma_pagamento 1
('Pix');    -- id_forma_pagamento 2

-- -------------------------
-- INSERÇÕES DE PAGAMENTO (10 registros)
-- -------------------------
INSERT INTO Pagamento (id_forma_pagamento, status_pagamento) VALUES
(1, TRUE),  -- id_pagamento 1: Cartão, Pago
(2, TRUE),  -- id_pagamento 2: Pix, Pago
(1, TRUE),  -- id_pagamento 3: Cartão, Pago
(2, TRUE),  -- id_pagamento 4: Pix, Pago
(1, TRUE),  -- id_pagamento 5: Cartão, Pago
(2, TRUE),  -- id_pagamento 6: Pix, Pago
(1, FALSE), -- id_pagamento 7: Cartão, Pendente
(2, TRUE),  -- id_pagamento 8: Pix, Pago
(1, FALSE), -- id_pagamento 9: Cartão, Pendente
(2, TRUE);  -- id_pagamento 10: Pix, Pago

-- -------------------------
-- INSERÇÕES DE PEDIDO (10 registros)
-- -------------------------
-- Nota: O campo id_funcionario não existe na tabela Pedido. A inserção está correta usando apenas id_pessoa e id_pagamento.
INSERT INTO Pedido (id_pessoa, id_pagamento, data_pedido) VALUES
( 1, 1, '2023-08-01 10:00:00'),  -- Pedido 1: Cliente 1
( 2, 2, '2023-08-02 11:30:00'),  -- Pedido 2: Cliente 2
( 3, 3, '2023-08-03 12:45:00'),  -- Pedido 3: Cliente 3
( 4, 4, '2023-08-04 15:00:00'),  -- Pedido 4: Cliente 4
( 1, 5, '2023-08-05 16:20:00'),  -- Pedido 5: Cliente 1
(2, 6, '2023-08-06 17:05:00'),  -- Pedido 6: Cliente 2
( 3, 7, '2023-08-07 09:15:00'),  -- Pedido 7: Cliente 3
( 4, 8, '2023-08-08 14:00:00'),  -- Pedido 8: Cliente 4
( 1, 9, '2023-08-09 18:30:00'),  -- Pedido 9: Cliente 1
( 2, 10, '2023-08-10 20:00:00'); -- Pedido 10: Cliente 2
-- -------------------------
-- INSERÇÕES DE ITEM_PEDIDO (10 registros)
-- -------------------------
INSERT INTO Item_Pedido (id_pedido, id_produto, quantidade, valor_unitario) VALUES
-- Pedido 1: Hamburguer e batata
(1, 43, 1, 35.90), -- Super Cheddar GGOsMelt Bacon
(1, 2, 1, 12.90),  -- GGOsFritas Grande
-- Pedido 2: Hamburguer, bebida e acompanhamento
(2, 58, 1, 36.50), -- Duplo Burger com Queijo Clássico
(2, 14, 2, 6.90),  -- Coca-Cola 300ml (2 unidades)
(2, 8, 1, 15.90),  -- Chicken GGOsNuggets 6 unidades
-- Pedido 3: Bebidas
(3, 32, 5, 4.50),  -- Água Mineral (5 unidades)
(3, 27, 2, 9.90),  -- Del Valle Laranja 500ml (2 unidades)
-- Pedido 4: Dois hamburgueres
(4, 46, 1, 34.90), -- Duplo Quarterão Tradicional
(4, 47, 1, 34.90), -- Duplo Quarterão Bacon
-- Pedido 5: Hamburguer e batata, com molhos extras
(5, 54, 1, 27.60), -- Cheddar GGOsMelt Tradicional
(5, 4, 1, 7.90),   -- GGOsFritas Pequena
(5, 12, 1, 2.50),  -- Molho Barbecue
(5, 9, 2, 1.50),   -- Ketchup (2 unidades)
-- Pedido 6: Itens de cafeteria
(6, 36, 1, 8.90),  -- Café Premium 300ml
(6, 40, 1, 11.00), -- Capuccino 300ml
-- Pedido 7: Hamburguer e bebida (Pagamento Pendente)
(7, 50, 2, 31.20), -- GGOsNífico Bacon Original (2 unidades)
(7, 17, 2, 6.90),  -- Coca-Cola Zero 300ml (2 unidades)
-- Pedido 8: Hamburguer e nuggets
(8, 56, 1, 37.90), -- Duplo Burger Bacon Clássico
(8, 7, 1, 22.90),  -- Chicken GGOsNuggets 10 unidades
-- Pedido 9: Três quarterões com molho (Pagamento Pendente)
(9, 48, 3, 28.75), -- Quarterão com Queijo Simples (3 unidades)
(9, 13, 3, 2.50),  -- Molho Ranch (3 unidades)
-- Pedido 10: Hamburguer e bebida grande
(10, 44, 1, 32.50), -- Big GGOs Clássico
(10, 16, 1, 10.90); -- Coca-Cola 700ml