# Instalação

Para executar esta aplicação, é necessário NodeJS e Redis por padrão operando na porta 6379 (pode ser alterado modificando o arquivo models/classes-mqtt.js na variável OpcoesMosca).

Depois de instalar o [Node.js](https://nodejs.org/en/) e [Redis](https://redis.io/), é necessário instalar todas as dependências do projeto. Por linha de comando (cmd/sheel), navege que a pasta que contem o arquivo package.json e utilize o comando:

```npm install```

# Execução

Antes de tudo, verifique se o Redis esteja executando.

A aplicação pode ser executada em modo normal ou modo debug. Para executar em modo normal, utilize o comando

```npm start``` 

Para executar em modo debug, utilize o comando:

```npm start d``` ou ```npm start debug```
