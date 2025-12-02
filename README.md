Parte 2: Produzir relatório de aprendizagem da disciplina de DW1. (vale 2.0  pontos)

- Fale sobre seu projeto e os conhecimentos adquiridos com ele. Relate o que fez, as dificuldades que teve e como as superou. O que você esperava de seu projeto e o que conseguiu entregar. Experiências com uso de IA, o que foi mais fácil e/ou importante. Qual sua preferência (backend/frontend). Mínimo de 1 e máximo de 3 páginas.

O relatório deve estar no [README.md](http://README.md) do repositório git do projeto.  

# Relatório de Aprendizagem – Desenvolvimento Web 1 (DW1)

## 2. Descrição do Projeto
**Nome do projeto:** GGO_Donald's

**Objetivo geral do projeto:**  
O objetivo do projeto é desenvolver um sistema completo de cardápio digital com backend e frontend integrados, onde:

- O cardápio de produtos é exibido dinamicamente, utilizando **JavaScript, HTML, CSS e Node.js**.
- As informações dos produtos são carregadas diretamente de um banco de dados **PostgreSQL**.
- O usuário pode gerar uma **prévia da conta** a partir da seleção de produtos, além de acessar uma **tela de pagamento** com verificações de CPF e cartão.
- O sistema possui uma **área administrativa** com acesso exclusivo para funcionários com cargo de *admin* ou *chefe*.
- Existem telas dedicadas à administração com geração de tabelas totalmente consistentes com o banco de dados.
- Nessas telas o administrador pode realizar **operações CRUD completas** (inserir, alterar, excluir e pesquisar) para entidades como funcionário, produto, categoria, cargo e outras.


Funcionalidades implementadas
### Funcionalidades implementadas
#### Área do Cliente
- Exibição dinâmica do cardápio com produtos carregados do banco de dados.
- Atualização automática das informações e imagens dos produtos.
- Sistema de seleção de produtos para gerar a prévia da conta.
- Tela de pagamento com validação de CPF e número de cartão.

#### Área Administrativa
- Tela de login com verificação de cargo.
- Geração automática de tabelas consistentes com o banco de dados.
- CRUD completo para:
  - Funcionário
  - Produto
  - Categoria
  - Cargo
  - (adicione outras se quiser)

#### Backend
- Rotas organizadas seguindo padrão de controllers.
- Integração completa com o banco de dados.
  
#### frontend
- O código recebe os dados por meio das APIs (rotas) criadas no backend, e o frontend utiliza essas
  informações para exibir o cardápio e gerar as tabelas usadas nas telas de CRUD.

## 3. Conhecimentos Adquiridos
Durante o desenvolvimento do projeto, aprendi: 

&nbsp;&nbsp; Durante o projeto consegui entender melhor o motivo de utilizar rotas e controlers, apliquei alguns frameworks como o CREATE e RICE.

Consegui entender melhor oque cada erro no terminal significava por exemplo havia vezes que eu criava uma rota e esquecia de coloca-la no server.js e isso ocasionava em erros,

e aprendi a entender um pouco daqueles erros que o banco envia ao terminal do vscode, quando vc tenta inserir, buscar, excluir ou alterar e acaba ativando violações de integridade.


## 4. O que Eu Fiz no Projeto
Eu separei os CRUDs em partes, onde não fica uma tela para todos os CRUDs, mas sim uma tela para cada crud e uma tela menu.html ou arquivo "raiz", e assim todos os cruds ficam conectados,

tornando os assim faceis e praticos para serem acessados.

## 🧩 5. Dificuldades e Superações
Dificuldades encontradas:

- O proprio chatGPT foi um baita problema
    – comecei a exeperimentar alguns dos frameworks passados e eles reduziram o erro mas mesmo assim algumas coisas ela não fazia do jeito correto  
- Tentei implementar a tela de crud pedido mas a ia simplesmente se recusava a fazer
   – Até o presente momento dia 2/12, ainda não consegui arrumar mas vou dar um jeito.   
- Entender os codigos que ela gerava e que diga-se de passagem a todo momento dava erro
  – Mas depois de dias e horas de muitos prompts e trocas de ofensa (senm dúvidas da minha parte), consegui entender e assim eu e a IA conseguimos solucionar os erros.

## 🤖 6. Experiência com uso de IA
[Explique aqui como usou IA no desenvolvimento do projeto, o que ajudou mais, e como isso facilitou seu aprendizado.]

---

## 🔧 7. O que Eu Esperava x O que Entreguei
[Escreva 1 ou 2 parágrafos explicando suas expectativas no início do projeto e o que de fato conseguiu entregar.]

---

## 🎨 8. Preferência: Backend ou Frontend?
[Explique qual área você prefere e por quê.]

---

## 📚 9. Conclusão
[Finalize com um parágrafo resumindo sua evolução e o impacto da disciplina no seu aprendizado.]

---
