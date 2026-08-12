package com.oficinacontable.gestionClientes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "declaraciones_mensuales", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_cliente", "anio", "mes", "tipo_impuesto"})
})
public class DeclaracionMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_declaracion")
    private Long idDeclaracion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private Integer anio;

    @Column(nullable = false)
    private Integer mes;

    @Column(name = "tipo_impuesto", nullable = false)
    private String tipoImpuesto = "IVA_PEQUENO"; // IVA_PEQUENO, IVA_GENERAL, ISR_TRIMESTRAL, RETENCIONES_ISR

    @Column(name = "estado_semaforo", nullable = false)
    private String estadoSemaforo = "FUTURO";

    @Column(name = "fecha_vencimiento")
    private String fechaVencimiento;

    @Column(name = "fecha_presentacion")
    private String fechaPresentacion;

    @Column(name = "numero_formulario_sat")
    private String numeroFormularioSat;

    @Column(name = "ruta_comprobante_pdf")
    private String rutaComprobantePdf;

    @Column(name = "observaciones_bitacora")
    private String observacionesBitacora;

    public DeclaracionMensual() {
    }

    public DeclaracionMensual(Cliente cliente, Integer anio, Integer mes, String tipoImpuesto, String estadoSemaforo, String fechaVencimiento, String fechaPresentacion, String numeroFormularioSat, String rutaComprobantePdf, String observacionesBitacora) {
        this.cliente = cliente;
        this.anio = anio;
        this.mes = mes;
        this.tipoImpuesto = tipoImpuesto;
        this.estadoSemaforo = estadoSemaforo;
        this.fechaVencimiento = fechaVencimiento;
        this.fechaPresentacion = fechaPresentacion;
        this.numeroFormularioSat = numeroFormularioSat;
        this.rutaComprobantePdf = rutaComprobantePdf;
        this.observacionesBitacora = observacionesBitacora;
    }

    public Long getIdDeclaracion() {
        return idDeclaracion;
    }

    public void setIdDeclaracion(Long idDeclaracion) {
        this.idDeclaracion = idDeclaracion;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Integer getAnio() {
        return anio;
    }

    public void setAnio(Integer anio) {
        this.anio = anio;
    }

    public Integer getMes() {
        return mes;
    }

    public void setMes(Integer mes) {
        this.mes = mes;
    }

    public String getTipoImpuesto() { return tipoImpuesto; }
    public void setTipoImpuesto(String tipoImpuesto) { this.tipoImpuesto = tipoImpuesto; }

    public String getEstadoSemaforo() {
        return estadoSemaforo;
    }

    public void setEstadoSemaforo(String estadoSemaforo) {
        this.estadoSemaforo = estadoSemaforo;
    }

    public String getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(String fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public String getFechaPresentacion() {
        return fechaPresentacion;
    }

    public void setFechaPresentacion(String fechaPresentacion) {
        this.fechaPresentacion = fechaPresentacion;
    }

    public String getNumeroFormularioSat() {
        return numeroFormularioSat;
    }

    public void setNumeroFormularioSat(String numeroFormularioSat) {
        this.numeroFormularioSat = numeroFormularioSat;
    }

    public String getRutaComprobantePdf() {
        return rutaComprobantePdf;
    }

    public void setRutaComprobantePdf(String rutaComprobantePdf) {
        this.rutaComprobantePdf = rutaComprobantePdf;
    }

    public String getObservacionesBitacora() {
        return observacionesBitacora;
    }

    public void setObservacionesBitacora(String observacionesBitacora) {
        this.observacionesBitacora = observacionesBitacora;
    }
}