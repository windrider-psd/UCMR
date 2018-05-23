# Instalação

Para executar esta aplicação, é necessário NodeJS e Redis por padrão operando na porta 6379 (pode ser alterado modificando o arquivo models/classes-mqtt.js na variável OpcoesMosca).

Depois de instalar o [Node.js](https://nodejs.org/en/) e [MongoDB](https://www.mongodb.com/), é necessário instalar todas as dependências do projeto. Por linha de comando (cmd/sheel), navege que a pasta que contem o arquivo package.json e utilize o comando:

```sh 
npm install
```

# Execução

Antes de tudo, verifique se o MongoDB esteja executando.

Para executar a aplicação, utilize o seguinte comando:

```sh 
npm start 
``` 

## Parametros

O UCMR tem 3 parâmetros, modo debug, porta para a interface (servidor web) e porta do socket.io para atualizações em tempo real.

--port: Porta para a interface (Servidor Web). Padrão 2000;
--ioport: Porta do socket.io. Padrão 2001;
--mqttport: Porta do MQTT. Padrão 1883;
--debug: Iniciar em modo debug. Padrão falso;
--solarinterval: Intervalo em segundos entre checagem de produção de paineis solares. Padrão 180;
--cleardb: Elimina todos os dados do UCMR da base de dados. Padrão falso.

### Exemplo

```sh 
npm start -- --port 3000 --ioport 7000 --debug --solarinterval 30 --cleardb --mqttport 5000
``` 
