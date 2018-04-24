package Servidores;



public class Servidor extends Thread implements Runnable {
    
    public ServidorDispositivos servidorDispositivos;
    public ServidorInterface servidorInterface;
    
    public Servidor(int portaInterface, int portaDispositivos)
    {
         servidorDispositivos = new ServidorDispositivos(this, portaDispositivos);
         servidorInterface = new ServidorInterface(this, portaInterface);
         servidorInterface.start();
         servidorDispositivos.start();
    }
    
}
