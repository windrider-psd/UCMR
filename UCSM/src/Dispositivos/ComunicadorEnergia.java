package Dispositivos;
import java.io.IOException;
import java.net.Socket;

public class ComunicadorEnergia extends Dispositivo {
    
    private float energiaBaterias;
    private float energiaBateriasMaxima;
    private float energiaProduzidaAtual;
    private float custoEnergia;
    private float consumoEnergiaAtual;
    
    public ComunicadorEnergia(int codigo, Socket socket, String host, int porta) throws IOException {
        super(codigo, socket, host, porta);
    }
    
    public void setEstado(int estado)
    {
        //?
    }


    public void TratarLeitura(String recebido) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
}
