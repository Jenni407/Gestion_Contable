package com.oficinacontable.gestionClientes.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EncriptacionUtilTest {

    @Test
    void encriptarYDesencriptarDevuelveElTextoOriginal() {
        String original = "password-secreto-123";
        String cifrado = EncriptacionUtil.encriptar(original);

        assertNotNull(cifrado);
        assertNotEquals(original, cifrado);
        assertEquals(original, EncriptacionUtil.desencriptar(cifrado));
    }

    @Test
    void encriptarNullOVacioSeDevuelveSinCambios() {
        assertNull(EncriptacionUtil.encriptar(null));
        assertEquals("", EncriptacionUtil.encriptar(""));
        assertEquals("   ", EncriptacionUtil.encriptar("   "));

        assertNull(EncriptacionUtil.desencriptar(null));
        assertEquals("", EncriptacionUtil.desencriptar(""));
    }

    @Test
    void encriptarTextosDistintosProduceCifradosDistintos() {
        String c1 = EncriptacionUtil.encriptar("clave-a");
        String c2 = EncriptacionUtil.encriptar("clave-b");
        assertNotEquals(c1, c2);
    }

    @Test
    void encriptarEsReversibleConCaracteresEspeciales() {
        String original = "P@ssw0rd#€ñá 123";
        assertEquals(original, EncriptacionUtil.desencriptar(EncriptacionUtil.encriptar(original)));
    }
}
