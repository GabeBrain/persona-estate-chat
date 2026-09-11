# Atualizar retratos e filtro por cidade

## Objetivo
Melhorar a apresentação das quatro personas mais recentes e facilitar a navegação da galeria por cidade.

## Alterações
- Substituir as ilustrações de Gilmar Novak, Thiago Teodoro, André Bordignon e Vinícius Queiroz pelos novos retratos fotorrealistas, mantendo o enquadramento consistente nos cards.
- Adicionar, acima da galeria, um botão de filtro por cidade com as opções encontradas nas próprias personas e uma opção para exibir todas.
- Atualizar a quantidade e a mensagem da galeria conforme o filtro, incluindo um estado vazio caso nenhuma persona corresponda.
- Manter o filtro na URL para que a seleção possa ser recarregada e compartilhada.
- Incluir dimensões explícitas nas imagens para preservar o layout durante o carregamento.

## Validação
- Verificar a página em desktop e celular.
- Confirmar que cada cidade mostra somente as personas correspondentes e que “Todas as cidades” restaura a lista completa.
- Confirmar que os quatro novos retratos aparecem corretamente e que a página não apresenta erros.

## Detalhes técnicos
- O filtro será validado como parâmetro de busca da rota inicial e aplicado no navegador, sem login ou armazenamento adicional.
- Serão reutilizados os controles visuais e os tokens já existentes no projeto.
