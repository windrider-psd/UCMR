/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servidores;

import Dispositivos.ComunicadorEnergia;
import java.util.ArrayList;
import Dispositivos.Sonoff;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ServidorDispositivos extends Thread implements Runnable{
    
    private ArrayList<Sonoff> listaSonoff = new ArrayList<>();
    public final Lock lockListaSO = new ReentrantLock();
    private ComunicadorEnergia comunicadorEnergia; 
    private ServerSocket socket;
    private Servidor master;
    
    
    class clienteDispositivo extends Thread implements Runnable
    {
        private final Socket socket;
        private int codigo;
        private byte[] buffer = new byte[1024];
        public clienteDispositivo(Socket socket)
        {
            this.socket = socket;
        }
        
        
        private boolean esperarAceite()
        {
 
            try
            {
                byte[] bufferReceber = new byte[1024];
                String envio = "codigo\n" + Integer.toString(codigo);
                socket.getOutputStream().write(envio.getBytes());
                int tam = socket.getInputStream().read(bufferReceber);
                String recebido = new String(bufferReceber, 0, tam);
                String conteudo[];
                conteudo = recebido.split("\\n");
                return conteudo[0].equals("1");
                
            }
            catch(IOException ex)
            {
                ex.printStackTrace();
                return false;
            }
        }
        
        @Override
        public void run ()
        {
            BufferedReader reader;
            try {
                int tam = socket.getInputStream().read(buffer);
                String recebido = new String(buffer, 0, tam);
                String conteudo[];
                conteudo = recebido.split("\\n");
                    if(conteudo[0].equals("sonoff"))
                    {
                        try
                        {
                            lockListaSO.lock();
                            if(conteudo[1].equals("0"))
                            {
                                do
                                {
                                  codigo = ThreadLocalRandom.current().nextInt(1, 500 + 1);  
                                }while(codigoExiste(codigo));
                                
                                if(esperarAceite())
                                {
                                    Sonoff sonOff = new Sonoff(codigo, socket, "localhost", 5000);
                                    sonOff.setNome(Integer.toString(codigo));
                                    listaSonoff.add(sonOff);
                                    sonOff.start(); 
                                }
                                else
                                {
                                    return;
                                }
                                
                            }
                            else
                            {
                                codigo = Integer.parseInt(conteudo[1]);
                                boolean existe = false;
                                for(Sonoff son : listaSonoff)
                                {
                                    if(son.getCodigo() == codigo)
                                    {
                                        son.setSocket(socket);
                                        son.setVivo(true);
                                        son.setLigado(conteudo[2].equals("1"));
                                        existe = true;
                                        break;
                                    }
                                }
                                if(!existe)
                                {
                                    while(codigoExiste(codigo))
                                    {
                                        codigo = ThreadLocalRandom.current().nextInt(1, 500 + 1);  
                                    }

                                    if(esperarAceite())
                                    {
                                        Sonoff sonOff = new Sonoff(codigo, socket, "localhost", 5000);
                                        sonOff.setNome(Integer.toString(codigo));
                                        listaSonoff.add(sonOff);
                                        sonOff.start(); 
                                    }
                                    else
                                    {
                                        return;
                                    }
                                }
                            }
                            
                            System.out.println("Sonoff adicionado");
                        }
                        finally
                        {
                            lockListaSO.unlock();
                        }
                        
                    }

                }
                catch (IOException ex) {
                    Logger.getLogger(ServidorDispositivos.class.getName()).log(Level.SEVERE, null, ex);
                }
            } 
        
    }
    
    public ServidorDispositivos(Servidor master, int porta)
    {
        try {
            socket = new ServerSocket(porta);
            this.master = master;
        } catch (IOException ex) {
           ex.printStackTrace();
        }
    }
    
    public void ExcluirSonoff(int codigoSonoff)
    {
        try
        {
            lockListaSO.lock();
            for(int i = 0; i < listaSonoff.size(); i++)
            {
                Sonoff sonoff = listaSonoff.get(i);
                if(sonoff.getCodigo() == codigoSonoff)
                {
                    sonoff.ExcluirDispositivo();
                    listaSonoff.remove(sonoff);
                    break;
                }
            }
        }
        finally
        {
            lockListaSO.unlock();
        }
        
    }
    
    public void MudarNomeSonoff(int codigoSonoff, String nome)
    {
        try
        {
            lockListaSO.lock();
            for(int i = 0; i < listaSonoff.size(); i++)
            {
                Sonoff sonoff = listaSonoff.get(i);
                if(sonoff.getCodigo() == codigoSonoff)
                {
                    sonoff.setNome(nome);
                    break;
                }
            }
        }
        finally
        {
            lockListaSO.unlock();
        }
        
    }
    
    public void SwitchSonoff(int codigoSonoff, boolean valor)
    {
        try
        {
            lockListaSO.lock();
            for(int i = 0; i < listaSonoff.size(); i++)
            {
                Sonoff sonoff = listaSonoff.get(i);
                if(sonoff.getCodigo() == codigoSonoff)
                {
                    sonoff.setLigado(valor);
                    break;
                }
            }
        }
        finally
        {
            lockListaSO.unlock();
        }
    }
    
    @Override
    public void run()
    {
        int codigo;

        while(true)
        {
            try
            {
                Socket novoDispositivo = socket.accept();

                clienteDispositivo cliente = new clienteDispositivo(novoDispositivo);
                cliente.start();
                
            }
            catch(IOException e)
            {
                
            }
        }
    }
    
    private boolean codigoExiste(int codigo)
    {
        for(int i = 0; i < listaSonoff.size(); i++)
        {
            if(listaSonoff.get(i).getCodigo() == codigo)
            {
                return true;
            }
        }
        return false;
    }

    public ArrayList<Sonoff> getListaSonoff() {
        return listaSonoff;
    }
    
    
    
    
}
