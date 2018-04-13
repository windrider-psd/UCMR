
package Servidores.Controladores;

import Servidores.Servidor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public abstract class Controlador {
    
    protected Servidor master;
    private final String urlBind;
    

    public Controlador(Servidor master, String urlBind) {
        this.master = master;
        this.urlBind = urlBind;
    }
    
    public abstract void IniciarProcesso(String requisicao);
    
    protected Map<String, String> getQueryMap(String query)
    {
        String[] params = query.split("&");
        ArrayList<String> repetidos = new ArrayList<>();
        Map<String, String> map = new HashMap<>();
        for (String param : params)
        {
            String name = param.split("=")[0];
            String value = param.split("=")[1];
            if(repetidos.contains(name))
            {
                continue;
            }
            repetidos.add(name);
            map.put(name, value);
        }
        return map;
    }
    
    protected boolean GetsExistem(Set<String> gets, String... necessarios)
    {
        int totalNecessarios = necessarios.length;
        int totalExistem = 0;
        for (String necessario : necessarios) 
        {
            for (String get : gets)
            {
                if(get.equals(necessario))
                {
                    totalExistem++;
                    break;
                }
            }
        }
        return totalExistem == totalNecessarios;
    }

    public String getNomeView() {
        return urlBind;
    }
    
}
