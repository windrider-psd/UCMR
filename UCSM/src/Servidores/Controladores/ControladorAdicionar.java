package Servidores.Controladores;

import Servidores.Servidor;
import java.util.Map;
import java.util.Set;
import simuladores.SimSonoff;

/**
 *
 * @author cpol
 */
public class ControladorAdicionar extends Controlador {

    public ControladorAdicionar(Servidor master) {
        super(master, "/adicionar");
    }

    @Override
    public void IniciarProcesso(String requisicao) {
        
        String getsString = requisicao.split("\\?")[1];
        Map<String, String> getsMap = getQueryMap(getsString);
        Set<String> chaveGets = getsMap.keySet();
        
        if(GetsExistem(chaveGets, "tipo"))
        {
             if(getsMap.get("tipo").equals("sonoff"))
             {
                 SimSonoff sim = new SimSonoff();
                 sim.start();
             }
        } 
    }
 
}
