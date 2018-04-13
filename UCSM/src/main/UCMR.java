package main;

import Servidores.Servidor;
import java.util.logging.Level;
import java.util.logging.Logger;
import simuladores.SimSonoff;

public class UCMR {

    public static void main(String[] args) 
    {
        Servidor server = new Servidor(80, 5000);
        server.start();
        try {
            Thread.sleep(1000);
            SimSonoff sim1 = new SimSonoff();
            SimSonoff sim2 = new SimSonoff();
            sim1.start();
            sim2.start();
            System.out.println("Dormindo");
            Thread.sleep(5000);
            sim1.socket.close();
            System.out.println("encerou sim1");
            Thread.sleep(5000);
            sim1.Iniciar();
            System.out.println("Reiniciou sim1");
            
            
        } catch (Exception ex) {
            Logger.getLogger(UCMR.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
}
