**Aluno:** Gabriel Gomes Ortiz  
**Data:** 04/12/2025
 

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

---

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
  
#### Frontend
- O código recebe os dados por meio das APIs (rotas) criadas no backend, e o frontend utiliza essas informações para exibir o cardápio e gerar as tabelas usadas nas telas de CRUD.

---

## 3. Conhecimentos Adquiridos

Durante o desenvolvimento do projeto, aprendi: 

Durante o projeto consegui entender melhor o motivo de utilizar rotas e controllers, apliquei alguns frameworks como o CREATE e RICE.

Consegui entender melhor o que cada erro no terminal significava. Por exemplo, havia vezes em que eu criava uma rota e esquecia de colocá-la no server.js, e isso ocasionava erros.

Aprendi a entender um pouco daqueles erros que o banco envia ao terminal do VSCode quando você tenta inserir, buscar, excluir ou alterar e acaba ativando violações de integridade.

---

## 4. O que Eu Fiz no Projeto

Eu separei os CRUDs em partes, onde não fica uma tela para todos os CRUDs, mas sim uma tela para cada CRUD e uma tela menu.html ou arquivo "raiz", e assim todos os CRUDs ficam conectados, tornando-os assim fáceis e práticos para serem acessados.

---

## 5. Dificuldades e Superações

Dificuldades encontradas:

- O próprio ChatGPT foi um baita problema:
  
  – Comecei a experimentar alguns dos frameworks passados e eles reduziram o erro, mas mesmo assim algumas coisas ela não fazia do jeito correto.
  
- Tentei implementar a tela de CRUD pedido, mas a IA simplesmente se recusava a fazer:

  – E isso, até o presente momento dia 2/12, ainda não consegui arrumar, mas vou dar um jeito.
  
- Entender os códigos que ela gerava e que, diga-se de passagem, a todo momento davam erros:

  – Mas depois de dias e horas de muitos prompts e trocas de ofensa (sem dúvidas da minha parte), consegui entender, e assim nós (eu e a IA) conseguimos solucionar boa parte dos erros.

---

## 6. Experiência com uso de IA

Minha experiência com IA foi meio “agridoce”, pois não consigo explicar exatamente o que sinto em relação a ela. E como é uma tecnologia desenvolvida recentemente, apesar de o conceito existir há muito tempo, ainda não dá para esperar resultados perfeitos. Mesmo assim, ela foi muito útil: como os trabalhos ficaram mais complexos e longos, a IA ajudou bastante a otimizar a resolução de problemas e as implementações. Porém, ainda é complicada de trabalhar, já que nem sempre ela vai acertar; na verdade, muitas vezes vai errar. Por causa disso, em vários dias eu acabava perdendo desempenho, porque ela me passava algo incorreto e nós ficávamos horas tentando resolver esses erros. 

Para completar, minha sensação é que a programação está se tornando sem graça, e digo isso por mim, pois não sinto mais aquela sensação de superação do tipo "caraca eu consegui !!!!!!". Não sei, eu sinto que perdeu um pouco daquele caráter instigante. E assim, antes de ter essa oportunidade de ouro, que sem dúvidas é estudar na UTF, eu não havia tido nenhuma experiência real de programação, e confesso que mal sabia usar um computador direito. Mas foi aqui, com Algoritmos, que descobri o que era programar e assim peguei gosto por programar ao ponto de todo dia à noite, no período letivo, eu acabar resolvendo todas as listas que eram passadas, e não fazia isso porque queria as maiores notas nas provas, porque essas acabavam vindo por consequência de estudar. Estudar programação sempre foi, e ainda é, uma atividade prazerosa para mim. E isso quando não me sinto limitado pela IA, porque é muito gratificante colocar a nossa própria lógica para funcionar, encontrar diferentes maneiras de resolver um mesmo problema, deixar a nossa autoria no que programamos e, sem dúvidas, é maravilhoso entender o papel de cada linha no script. Isso é legal e benéfico. 

Concluindo meu raciocínio, pode ser apenas uma interpretação emocional demais da situação, mas é isso que sinto em relação ao uso de IA.

---

## 7. O que Eu Esperava x O que Entreguei

Eu gostaria de ter entregado um projeto mais completo, com funcionalidades reais, como sistema de pagamento, recuperação de senha e um esquema de hierarquia entre os usuários do site. Mas, por falta de tempo, acabei entregando algo que não está exatamente incompleto, mas não está do jeito que eu queria. Ainda assim, estou satisfeito por ter conseguido finalizar o projeto dentro do prazo.

---

## 8. Preferência: Backend ou Frontend?

Eu gosto muito de trabalhar com a parte de backend. Porém, se necessário, também posso trabalhar no frontend, mas o que eu realmente gosto é do backend.
