package com.oficinacontable.gestionClientes.dto;

public class CredencialDTO {

    private Long id;
    private String servicio;
    private String usuario;
    private String password;
    private String url;
    private String notas;

    public CredencialDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getServicio() { return servicio; }
    public void setServicio(String servicio) { this.servicio = servicio; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}
