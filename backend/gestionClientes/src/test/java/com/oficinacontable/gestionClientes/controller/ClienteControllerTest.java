package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.service.EventoService;
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
class ClienteControllerTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private EventoService eventoService;

    @InjectMocks
    private ClienteController clienteController;

    @Test
    void guardarClienteLlamaAlRepositorio() {
        Cliente cliente = new Cliente();
        cliente.setNit("1234567-8");
        cliente.setNombreRazonSocial("Cliente Prueba");
        cliente.setRegimenFiscal("PEQUENO CONTRIBUYENTE");

        when(clienteRepository.save(any(Cliente.class))).thenAnswer(inv -> inv.getArgument(0));

        Cliente guardado = clienteController.guardarCliente(cliente);

        assertNotNull(guardado);
        assertEquals("1234567-8", guardado.getNit());
        verify(clienteRepository).save(cliente);
    }

    @Test
    void actualizarClienteInexistenteDevuelve404() {
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        var respuesta = clienteController.actualizarCliente(99L, new Cliente());

        assertEquals(404, respuesta.getStatusCode().value());
    }
}
