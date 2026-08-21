package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.config.EncriptacionUtil;
import com.oficinacontable.gestionClientes.dto.CredencialDTO;
import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.model.Credencial;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.repository.CredencialRepository;
import com.oficinacontable.gestionClientes.service.EventoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CredencialControllerTest {

    @Mock
    private CredencialRepository credencialRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private EventoService eventoService;

    @InjectMocks
    private CredencialController credencialController;

    @Test
    void crearCredencialCifraLaContrasena() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(1L);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(credencialRepository.save(any(Credencial.class))).thenAnswer(inv -> inv.getArgument(0));

        CredencialDTO dto = new CredencialDTO();
        dto.setServicio("SAT");
        dto.setUsuario("carlos@correo.com");
        dto.setPassword("secreto123");

        var respuesta = credencialController.crear(1L, dto);
        assertEquals(200, respuesta.getStatusCode().value());

        ArgumentCaptor<Credencial> captor = ArgumentCaptor.forClass(Credencial.class);
        verify(credencialRepository).save(captor.capture());
        Credencial guardada = captor.getValue();

        assertNotNull(guardada.getPasswordCifrada());
        assertNotEquals("secreto123", guardada.getPasswordCifrada());
        assertEquals("secreto123", EncriptacionUtil.desencriptar(guardada.getPasswordCifrada()));
    }

    @Test
    void crearCredencialSinServicioDevuelve400() {
        CredencialDTO dto = new CredencialDTO();
        var respuesta = credencialController.crear(1L, dto);
        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void listarNoExponeContrasenas() {
        Credencial c = new Credencial();
        c.setIdCredencial(1L);
        c.setServicio("FEL");
        c.setPasswordCifrada("cifrada");
        when(credencialRepository.findByClienteIdClienteOrderByServicioAsc(1L)).thenReturn(List.of(c));

        var respuesta = credencialController.listar(1L);
        List<CredencialDTO> lista = respuesta.getBody();

        assertNotNull(lista);
        assertEquals(1, lista.size());
        assertNull(lista.get(0).getPassword());
        assertEquals("FEL", lista.get(0).getServicio());
    }
}
