package com.oficinacontable.gestionClientes.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Migra las credenciales del esquema antiguo (tabla credenciales_clientes, 3 columnas fijas)
 * al nuevo esquema paramétrico (tabla credenciales, 1:N).
 *
 * Es idempotente: solo se ejecuta si la tabla nueva está vacía y la vieja aún tiene datos.
 * NO es un seeder de datos de negocio.
 */
@Component
public class MigracionCredenciales implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MigracionCredenciales.class);

    private final JdbcTemplate jdbcTemplate;

    public MigracionCredenciales(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer existentes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM credenciales", Integer.class);
            if (existentes != null && existentes > 0) {
                return; // ya hay credenciales; no se toca nada
            }
        } catch (Exception e) {
            // La tabla 'credenciales' no existe todavía; se continúa para intentar la migración.
            log.debug("Tabla credenciales no disponible aún: {}", e.getMessage());
        }

        try {
            Integer viejas = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM credenciales_clientes", Integer.class);
            if (viejas == null || viejas == 0) {
                return; // no hay datos antiguos que migrar
            }

            int a = jdbcTemplate.update(
                    "INSERT INTO credenciales (id_cliente, servicio, password_cifrada, creado_en, actualizado_en) " +
                    "SELECT id_cliente, 'Agencia Virtual', pass_agencia_virtual, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP " +
                    "FROM credenciales_clientes WHERE pass_agencia_virtual IS NOT NULL AND pass_agencia_virtual <> ''");

            int b = jdbcTemplate.update(
                    "INSERT INTO credenciales (id_cliente, servicio, password_cifrada, creado_en, actualizado_en) " +
                    "SELECT id_cliente, 'FEL', pass_fel, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP " +
                    "FROM credenciales_clientes WHERE pass_fel IS NOT NULL AND pass_fel <> ''");

            int c = jdbcTemplate.update(
                    "INSERT INTO credenciales (id_cliente, servicio, password_cifrada, creado_en, actualizado_en) " +
                    "SELECT id_cliente, 'Correo', pass_correo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP " +
                    "FROM credenciales_clientes WHERE pass_correo IS NOT NULL AND pass_correo <> ''");

            log.info("Migración de credenciales completada: Agencia Virtual={}, FEL={}, Correo={}", a, b, c);
        } catch (Exception e) {
            // Si la tabla antigua no existe o falla algo, no se detiene el arranque.
            log.debug("No se requirió migración de credenciales: {}", e.getMessage());
        }
    }
}
