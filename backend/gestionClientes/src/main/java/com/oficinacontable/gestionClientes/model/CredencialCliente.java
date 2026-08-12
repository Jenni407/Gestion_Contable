package com.oficinacontable.gestionClientes.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "credenciales_clientes")
public class CredencialCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_credencial")
    private Long idCredencial;

    @OneToOne
    @JoinColumn(name = "id_cliente", referencedColumnName = "id_cliente", nullable = false)
    @JsonIgnore
    private Cliente cliente;

    @Column(name = "pass_agencia_virtual")
    private String passAgenciaVirtual;

    @Column(name = "pass_fel")
    private String passFel;

    @Column(name = "pass_correo")
    private String passCorreo;

    public CredencialCliente() {}

    public Long getIdCredencial() { return idCredencial; }
    public void setIdCredencial(Long idCredencial) { this.idCredencial = idCredencial; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public String getPassAgenciaVirtual() { return passAgenciaVirtual; }
    public void setPassAgenciaVirtual(String passAgenciaVirtual) { this.passAgenciaVirtual = passAgenciaVirtual; }

    public void setPassFel(String passFel) { this.passFel = passFel; }
    public String getPassFel() { return passFel; }

    public String getPassCorreo() { return passCorreo; }
    public void setPassCorreo(String passCorreo) { this.passCorreo = passCorreo; }
}