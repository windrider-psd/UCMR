/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servidores.Controladores;

import Servidores.Servidor;
import Servidores.ServidorDispositivos;
import java.util.Map;
import java.util.Set;

/**
 *
 * @author cpol
 */
public class ControladorMudarNome extends Controlador {

    public ControladorMudarNome(Servidor master) {
        super(master, "/mudarnome");
    }

    @Override
    public void IniciarProcesso(String requisicao) {
        String getsString = requisicao.split("\\?")[1];
        Map<String, String> getsMap = getQueryMap(getsString);
        Set<String> chaveGets = getsMap.keySet();
        
        if(GetsExistem(chaveGets, "tipo", "codigo", "nome"))
        {
            String nomeReal = getsMap.get("nome").replace("+", " ");
            master.servidorDispositivos.MudarNomeSonoff(Integer.parseInt(getsMap.get("codigo")), nomeReal);
        }
    }
    
}
