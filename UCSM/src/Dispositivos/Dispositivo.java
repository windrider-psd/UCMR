package Dispositivos;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;


public abstract class Dispositivo extends Thread implements Runnable {
    
    private class VerificadorConexao extends Thread implements Runnable
    {
        @Override
        public void run()
        {
            while(executar)
            {
                
                setVivo(tentarConexao());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ex) {
                    
                }
            }
        }
        
        private boolean tentarConexao()
        {
            int tentativas = 0;
            while(tentativas != 5)
            {
                try
                {
                    String escrita = "check";
                    socket.getOutputStream().write(escrita.getBytes("UTF-8"));
                    return true;
                }
                catch (IOException e)
                {
                    tentativas++;
                }
            }
            vivo = false;
            return false;
        }
    }
    
    protected int codigo;
    protected String nome;
    protected boolean vivo;
    
    protected Socket socket;    
    private String host;
    private int porta;
    private final BufferedReader reader;
    private final BufferedWriter writer;
    //public abstract void TratarLeitura(String recebido);
    
    private VerificadorConexao verificador;
    private volatile boolean executar = true;
    private volatile boolean aceito = false;
    
    public Dispositivo(int codigo, Socket socket, String host, int porta) throws IOException
    {
        this.codigo = codigo;
        this.socket = socket;
        socket.setSoTimeout(3000);
        reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        this.host = host;
        this.porta = porta;

        verificador = new VerificadorConexao();
        verificador.start();
        
    }
    
    public void ExcluirDispositivo()
    {
        executar = false;
        try {
            verificador.join();
            socket.close();
        } catch (InterruptedException ex) {
            Logger.getLogger(Dispositivo.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(Dispositivo.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public int getCodigo() {
        return codigo;
    }

    public void setCodigo(int codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public synchronized boolean isVivo() {
        return vivo;
    }

    public synchronized void setVivo(boolean vivo) {
        
        this.vivo = vivo;
        
    }

    public Socket getSocket() {
        return socket;
    }

    public void setSocket(Socket socket) {
        this.socket = socket;
    }
    
    
}
