package Dispositivos;

import java.io.IOException;
import java.net.Socket;


public class Sonoff extends Dispositivo 
{
    public boolean ligado = false;
    
    public Sonoff(int codigo, Socket socket, String host, int porta) throws IOException {
        super(codigo, socket, host, porta);
    }

    
    public boolean isLigado() {
        return ligado;
    }

    public void setLigado(boolean ligado) {
        String mensagem = "comm\n";
        if(ligado)
        {
            mensagem += "1";
        }
        else
        {
            mensagem += "0";
        }
        try
        {
            byte[] bytesMensagem = mensagem.getBytes();
            socket.getOutputStream().write(bytesMensagem);

            this.ligado = ligado;
        }
        catch(IOException ex)
        {
            ex.printStackTrace();
            System.out.println("Erro em enviar bytes");
        }
        
    }



    /*public void TratarLeitura(String recebido) {
        if(recebido.equals("ligar"))
        {
            ligado = true;
            System.out.println("Ligei");
        }
        else if(recebido.equals("desligar"))
        {
            System.out.println("Desliguei");
            ligado = false;
        }
        else
        {
            System.out.println("operação inválida: " + recebido);
        }
    }*/
    

    
    
    
}
