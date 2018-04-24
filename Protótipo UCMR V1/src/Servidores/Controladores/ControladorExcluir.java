package Servidores.Controladores;

import Servidores.Servidor;
import java.util.Map;
import java.util.Set;

public class ControladorExcluir extends Controlador {

    public ControladorExcluir(Servidor master) {
        super(master, "/excluir");
    }

    @Override
    public void IniciarProcesso(String requisicao) 
    {
        String getsString = requisicao.split("\\?")[1];
        Map<String, String> getsMap = getQueryMap(getsString);
        Set<String> chaveGets = getsMap.keySet();
        
        if(GetsExistem(chaveGets, "codigo", "tipo"))
        {
             if(getsMap.get("tipo").equals("sonoff"))
             {
                 master.servidorDispositivos.ExcluirSonoff(Integer.parseInt(getsMap.get("codigo")));
             }
        } 
    }
    
    
    
}
