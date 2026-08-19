package com.oficinacontable.gestionClientes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(nullable = false, unique = true)
    private String nit;

    @Column(name = "nombre_razon_social", nullable = false)
    private String nombreRazonSocial;

    @Column(name = "regimen_fiscal", nullable = false)
    private String regimenFiscal;

    @Column(name = "telefono")
    private String telefono;

// Configuraciones de Impuestos para Régimen General
    @Column(name = "aplica_iva_general", nullable = false)
    private Boolean aplicaIvaGeneral = true;

    @Column(name = "aplica_isrt", nullable = false)
    private Boolean aplicaIsrt = false;

    @Column(name = "aplica_retencion_isr", nullable = false)
    private Boolean aplicaRetencionIsr = false;

    @Column(name = "fecha_nacimiento")
    private String fechaNacimiento;

    @Column(name = "correo_electronico")
    private String correoElectronico;

    @Column(nullable = false)
    private String estado = "ACTIVO";

       @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        if (this.creadoEn == null) {
            this.creadoEn = LocalDateTime.now();
        }
    }

    // Relación OneToOne con CredencialCliente (cascade para guardar/actualizar ambas tablas juntas)
    @OneToOne(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CredencialCliente credencial;

    public Cliente() {
    }

    // Getters y Setters
    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getNombreRazonSocial() { return nombreRazonSocial; }
    public void setNombreRazonSocial(String nombreRazonSocial) { this.nombreRazonSocial = nombreRazonSocial; }

    public String getRegimenFiscal() { return regimenFiscal; }
    public void setRegimenFiscal(String regimenFiscal) { this.regimenFiscal = regimenFiscal; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public Boolean getAplicaIvaGeneral() { return aplicaIvaGeneral; }
    public void setAplicaIvaGeneral(Boolean aplicaIvaGeneral) { this.aplicaIvaGeneral = aplicaIvaGeneral; }

    public Boolean getAplicaIsrt() { return aplicaIsrt; }
    public void setAplicaIsrt(Boolean aplicaIsrt) { this.aplicaIsrt = aplicaIsrt; }

    public Boolean getAplicaRetencionIsr() { return aplicaRetencionIsr; }
    public void setAplicaRetencionIsr(Boolean aplicaRetencionIsr) { this.aplicaRetencionIsr = aplicaRetencionIsr; }

    public String getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    // Métodos para la credencial requeridos por el Controller
    public CredencialCliente getCredencial() { return credencial; }
    public void setCredencial(CredencialCliente credencial) { this.credencial = credencial; }
}