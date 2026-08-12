package com.oficinacontable.gestionClientes.dto;

public class DeclaracionDTO {

    private Long idCliente;
    private Integer anio;
    private Integer mes;
    private String tipoImpuesto;
    private String numeroFormularioSat;
    private String fechaPresentacion;
    private String observacionesBitacora;

    public DeclaracionDTO() {}

    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

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