import sys
import datetime
import urllib.request
import xml.etree.ElementTree as ET

import paho.mqtt.client as mqtt

from pymongo import MongoClient

cidadeArgv = sys.argv[1]
estadoArgv = sys.argv[2].upper()
usuarioMQTT = sys.argv[3]
senhaMQTT = sys.argv[4]
brokerURL = sys.argv[5]
brokerPort = int(sys.argv[6])
def enviarMensagem(mensagem):
    try:
        mensagem = str(mensagem)
        sys.stdout.write(mensagem)
        sys.stdout.flush()
    except Exception as e:
        print(e)

def encontrarCidade(nomeCidade, estado):
    try:
        estado = estado.upper()
        url = "http://servicos.cptec.inpe.br/XML/listaCidades?city="+nomeCidade.replace(' ', '%20')
        xml = urllib.request.urlopen(url).read()
        cidades = ET.fromstring(xml)

        for cidadeXML in cidades.findall("cidade"):
            uf = cidadeXML.find('uf').text
            nome = cidadeXML.find('nome').text
            if(uf == estado and nome.lower() == cidadeArgv.lower()):
                return {'id' : cidadeXML.find('id').text, 'nome' : nome, 'uf' : uf}

    except Exception as e:
        print(e)

def getProvisaoTempo(cidade):
    dia = datetime.datetime.now()
    dia = dia.strftime("%Y-%m-%d")
    url = "http://servicos.cptec.inpe.br/XML/cidade/"+cidade['id']+"/previsao.xml"
    xml = urllib.request.urlopen(url).read()
    parseado = ET.fromstring(xml)
    for previsao in parseado.findall("previsao"):
        diaPrevisao = previsao.find('dia').text
        if(diaPrevisao == dia):
            return {'tempo' : previsao.find('tempo').text, 'maxima': int(previsao.find('maxima').text), 'minima' : int(previsao.find('minima').text)}

        
cidade = encontrarCidade(cidadeArgv, estadoArgv)
previsao = getProvisaoTempo(cidade)
enviarMensagem(previsao)
clienteMQTT = mqtt.Client("Classificador")
clienteMQTT.username_pw_set(usuarioMQTT, senhaMQTT)
clienteMQTT.connect(brokerURL, brokerPort)




