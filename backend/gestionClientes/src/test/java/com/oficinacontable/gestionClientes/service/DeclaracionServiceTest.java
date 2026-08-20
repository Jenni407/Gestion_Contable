package com.oficinacontable.gestionClientes.service;

import com.oficinacontable.gestionClientes.dto.DeclaracionDTO;
import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.model.DeclaracionMensual;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.repository.DeclaracionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeclaracionServiceTest {

    @Mock
    private DeclaracionRepository declaracionRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private DeclaracionService declaracionService;

    @Test
    void registrarDeclaracionConFechaQuedaPresentada() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(1L);

        DeclaracionDTO dto = new DeclaracionDTO();
        dto.setIdCliente(1L);
        dto.setAnio(2026);
        dto.setMes(8);
        dto.setTipoImpuesto("IVA_PEQUENO");
        dto.setFechaPresentacion("2026-08-20");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(declaracionRepository.findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(1L, 2026, 8, "IVA_PEQUENO"))
                .thenReturn(Optional.empty());
        when(declaracionRepository.save(any(DeclaracionMensual.class))).thenAnswer(inv -> inv.getArgument(0));

        DeclaracionMensual resultado = declaracionService.registrarDeclaracion(dto);

        assertNotNull(resultado);
        assertEquals("PRESENTADO", resultado.getEstadoSemaforo());
        assertEquals(1L, resultado.getCliente().getIdCliente());
    }

    @Test
    void registrarDeclaracionSinFechaQuedaPendiente() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(2L);

        DeclaracionDTO dto = new DeclaracionDTO();
        dto.setIdCliente(2L);
        dto.setAnio(2026);
        dto.setMes(8);
        dto.setTipoImpuesto("IVA_PEQUENO");

        when(clienteRepository.findById(2L)).thenReturn(Optional.of(cliente));
        when(declaracionRepository.findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(2L, 2026, 8, "IVA_PEQUENO"))
                .thenReturn(Optional.empty());
        when(declaracionRepository.save(any(DeclaracionMensual.class))).thenAnswer(inv -> inv.getArgument(0));

        DeclaracionMensual resultado = declaracionService.registrarDeclaracion(dto);

        assertEquals("PENDIENTE", resultado.getEstadoSemaforo());
    }

    @Test
    void registrarDeclaracionConClienteInexistenteLanzaExcepcion() {
        DeclaracionDTO dto = new DeclaracionDTO();
        dto.setIdCliente(999L);

        when(clienteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> declaracionService.registrarDeclaracion(dto));
    }
}
