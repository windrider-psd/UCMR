# Instalação

Para executar esta aplicação, é necessário NodeJS e MongoDB por padrão operando na porta 27017.

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

 - --debug: Iniciar em modo debug. Padrão falso;
 - --cleardb: Elimina todos os dados do UCMR da base de dados. Padrão falso.

### Exemplo

```sh 
npm start -- --debug --cleardb
``` 

## Configurações 

O UCMR tem um arquivo de configurações em bin/configuracoes.json. Essas configurações são:

 - init.port: Porta para a interface (Servidor Web).
 - init.ioport: Porta do socket.io.
 - init.mqttport: Porta do MQTT.
 - init.solarinterval: Intervalo em segundos entre checagem de produção de paineis solares.
