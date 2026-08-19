package com.oficinacontable.gestionClientes.dto;

public class DeclaracionDTO {

    private Long idCliente;
    private String nombreCliente;
    private String nit; 
    private Integer anio;
    private Integer mes;
    private String tipoImpuesto;
    private String numeroFormularioSat;
    private String fechaPresentacion;
    private String observacionesBitacora;

    public DeclaracionDTO() {}

    // Getters y Setters existentes + Getters/Setters de 'nit'
    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }

    public String getTipoImpuesto() { return tipoImpuesto; }
    public void setTipoImpuesto(String tipoImpuesto) { this.tipoImpuesto = tipoImpuesto; }

    public String getNumeroFormularioSat() { return numeroFormularioSat; }
    public void setNumeroFormularioSat(String numeroFormularioSat) { this.numeroFormularioSat = numeroFormularioSat; }

    public String getFechaPresentacion() { return fechaPresentacion; }
    public void setFechaPresentacion(String fechaPresentacion) { this.fechaPresentacion = fechaPresentacion; }

    public String getObservacionesBitacora() { return observacionesBitacora; }
    public void setObservacionesBitacora(String observacionesBitacora) { this.observacionesBitacora = observacionesBitacora; }
}