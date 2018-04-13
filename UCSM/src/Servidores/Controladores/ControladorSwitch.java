package Servidores.Controladores;

import Servidores.Servidor;
import java.util.Map;
import java.util.Set;
import simuladores.SimSonoff;

public class ControladorSwitch extends Controlador {
    
    public ControladorSwitch(Servidor master) {
        super(master, "/switch");
    }

    @Override
    public void IniciarProcesso(String requisicao) {
        String getsString = requisicao.split("\\?")[1];
        Map<String, String> getsMap = getQueryMap(getsString);
        Set<String> chaveGets = getsMap.keySet();
        
        if(GetsExistem(chaveGets, "codigo", "valor"))
        {
            master.servidorDispositivos.SwitchSonoff(Integer.parseInt(getsMap.get("codigo")), Boolean.valueOf(getsMap.get("valor")));
        } 
    } 
}
