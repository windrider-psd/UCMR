# Instalação

Para executar esta aplicação, é necessário NodeJS e Redis por padrão operando na porta 6379 (pode ser alterado modificando o arquivo models/classes-mqtt.js na variável OpcoesMosca).

Depois de instalar o [Node.js](https://nodejs.org/en/) e [Redis](https://redis.io/), é necessário instalar todas as dependências do projeto. Por linha de comando (cmd/sheel), navege que a pasta que contem o arquivo package.json e utilize o comando:

```npm install```

# Execução

Antes de tudo, verifique se o Redis esteja executando.

Para executar a aplicação, utilize o seguinte comando:

```sh 
npm start 
``` 

## Parametros

O UCMR tem 3 parâmetros, modo debug, porta para a interface (servidor web) e porta do socket.io para atualizações em tempo real.

```sh 
npm start -- --port 3000 --ioport 7000 --debug 
``` 

Neste exemplo acima, a porta do servidor web será 3000, a porta do socket.io será 7000 e o modo debug ativado.

Os valores padrões são porta 80 para servidor web, 8080 para socket.io e modo debug desativado.
