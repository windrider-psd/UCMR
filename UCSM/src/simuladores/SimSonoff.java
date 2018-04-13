package simuladores;

import java.io.IOException;
import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SimSonoff extends Thread implements Runnable{
    
    
    public Socket socket;
    public byte[] buffer = new byte[1024];
    public String tipo = "sonoff";
    public int codigo;
    public boolean ligado = false;
    public boolean conectado;
    public SimSonoff() {
        codigo = 0;
        
        try {
            socket = new Socket("localhost", 5000);
        } catch (IOException ex) {
            Logger.getLogger(SimSonoff.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    
    public void Iniciar()
    {
        try {
            socket = new Socket("localhost", 5000);
        } catch (IOException ex) {
            Logger.getLogger(SimSonoff.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    
    @Override
    public void run() {
        String stringEstado;
        if(ligado == true)
        {
            stringEstado = "1";
        }
        else
        {
            stringEstado = "0";
        }

        

        while(true)
        {
            try 
            {
                if(!conectado)
                {
                    String identidade = tipo + "\n" + Integer.toString(codigo) + "\n" + stringEstado;
                    socket.getOutputStream().write(identidade.getBytes());
                    conectado = true;
                }
                
                Thread.sleep(1000);
                int tam = socket.getInputStream().read(buffer);
                String recebido = new String(buffer, 0, tam);
                String[] conteudo;
                conteudo = recebido.split("\\n");

                if(conteudo[0].equals("codigo"))
                {
                    codigo = Integer.parseInt(conteudo[1]);
                    String mensagemAceite = "1\n";
                    socket.getOutputStream().write(mensagemAceite.getBytes());
                }
                else if(conteudo[0].equals("comm"))
                {
                    if(conteudo[1].equals("0"))
                    {
                        ligado = false;
                    }
                    else if(conteudo[2].equals("1"))
                    {
                        ligado = true;
                    }
                }
                else if(conteudo[0].equals("check"))
                {
                    //
                }
                else
                {  
                    System.out.println("envio inválido");
                }
            }


            
            catch(IOException ex)
            {
                conectado = false;
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ex1) {
                    Logger.getLogger(SimSonoff.class.getName()).log(Level.SEVERE, null, ex1);
                }
            }
            catch (Exception ex) {
                ex.printStackTrace();

            }
        }
    }   
}
