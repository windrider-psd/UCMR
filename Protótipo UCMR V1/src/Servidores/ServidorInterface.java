package Servidores;

import Servidores.Controladores.Controlador;
import Dispositivos.Sonoff;
import Servidores.Controladores.ControladorAdicionar;
import Servidores.Controladores.ControladorExcluir;
import Servidores.Controladores.ControladorMudarNome;
import Servidores.Controladores.ControladorSwitch;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ServidorInterface extends Thread implements Runnable {
    
    
    private ArrayList<Controlador> views= new ArrayList<>();
    
    private class ClienteInterface implements Runnable 
    {
        private final Socket s;
        public ClienteInterface(Socket s)
        {
            this.s = s;
        }    
        @Override
        public void run ()
        {
            try
            {
                byte[] buf = new byte[9000];
                int tam = s.getInputStream().read(buf);
                String str = new String(buf, 0, tam);
                String[] linhas = str.split("\n");
                String[] comandos = linhas[0].split(" ");
                String requisicao = comandos[1];
                if(ProcessarRequisicao(requisicao.toLowerCase()))
                {
                    String retorno = "<!DOCTYPE html><html><head><title>Servidor</title></head><body><img src = 'brasao.png'><h1>Olá usuário!</h1><h2>Lista Sonoffs</h2>"
                    + "<table><thead><th>Código</th><th>Nome</th><th>Estado</th><th>Ação</th><th>Mudar Nome</th></thead><tbody>";
                    try
                    {
                        master.servidorDispositivos.lockListaSO.lock();
                        ArrayList<Sonoff> listaSonoff = master.servidorDispositivos.getListaSonoff();
                        for(int i = 0; i < listaSonoff.size(); i++)
                        {

                            Sonoff so = listaSonoff.get(i);
                            retorno += "<tr><td>"+so.getCodigo()+"</td>";
                            retorno += "<td>"+so.getNome()+"</td>";

                            if(so.isVivo() == false)
                            {
                                retorno += "<td>Desconectado</td><td> <a href = 'excluir?codigo="+so.getCodigo()+"&tipo=sonoff'><button>Excluir</button></td></a>";
                            }

                            else if(so.ligado == true)
                            {
                                retorno += "<td>Ligado</td><td> <a href = 'switch?codigo="+so.getCodigo()+"&valor=false'><button>Desligar</button></a></td>";
                            }
                            else
                            {
                                retorno += "<td>Desligado</td><td> <a href = 'switch?codigo="+so.getCodigo()+"&valor=true'><button>Ligar</button></a></td>";
                            }


                            retorno += "<td><form action = 'mudarnome' method = 'get'>"
                                    + "<input type = 'hidden' name = 'tipo' value = 'sonoff'><input type = 'hidden' name = 'codigo' value = '"+so.getCodigo()+"'>"
                                    + "<input type = 'text' name = 'nome' /><button type = 'submit'>Enviar</button></form></td></tr>";
                             
                   
                        }
                        retorno += "</tbody></table><h2>Debug</h2><a href = 'adicionar?tipo=sonoff'><button>Adicionar sonoff</button></a></body></html>";
                    }
                    finally
                    {
                        master.servidorDispositivos.lockListaSO.unlock();
                    }
                    s.getOutputStream().write(("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nVary: Accept-Encoding\r\n\n").getBytes());
                    s.getOutputStream().write(retorno.getBytes("UTF-8"));
                }

                	  
                else
                {
                    try
                    {
                        File f = new File("src/recursos" + requisicao);			
                        FileInputStream fin = new FileInputStream(f);

                        byte[] bufArquivo = new byte[(int) fin.getChannel().size()];
                        fin.read(bufArquivo);
                        //s.getOutputStream().write(("HTTP/1.1 200 OK\r\nContent-Type: image/jpeg; charset=utf-8\r\nVary: Accept-Encoding\r\n\n").getBytes());
                        s.getOutputStream().write(bufArquivo);
                    }
                    catch(FileNotFoundException e)
                    {
                        s.getOutputStream().write("Arquivo não existe".getBytes("UTF-8"));
                    }

                }	
                s.close();
            }
            catch(IOException e)
            {

            }
        }
    }
    
    
    
    private ServerSocket socket;
    private Servidor master;
    public ServidorInterface(Servidor master, int porta)
    {
        try {
            socket = new ServerSocket(porta);
            this.master = master;
            views.add(new ControladorExcluir(master));
            views.add(new ControladorAdicionar(master));
            views.add(new ControladorSwitch(master));
            views.add(new ControladorMudarNome(master));
        } catch (IOException ex) {
           ex.printStackTrace();
        }
    }
        
    public boolean ProcessarRequisicao(String requisicao)
    {
       
        String[] gets = requisicao.split("\\?");
        String nomeDocumento = gets[0];
        if(nomeDocumento.equals("/"))
        {
            return true;
        }
        for(int i = 0; i < views.size(); i++)
        {
            if(views.get(i).getNomeView().equals(nomeDocumento))
            {
                views.get(i).IniciarProcesso(requisicao);
                
                return true;
            }
        }
        return false;
    }
    
    
    @Override
    public void run() 
    {
        while(true)
        {
            try {
                Socket novoCliente = socket.accept();
                Thread threadCliente =  new Thread(new ClienteInterface(novoCliente)); 
                threadCliente.start();
                
            } catch (IOException ex) {
                Logger.getLogger(ServidorInterface.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }
    
}
