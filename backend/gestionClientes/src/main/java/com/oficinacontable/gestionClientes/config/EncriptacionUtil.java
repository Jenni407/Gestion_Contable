package com.oficinacontable.gestionClientes.config;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class EncriptacionUtil {

    // Clave AES configurable por variable de entorno o propiedad (mismo valor por defecto para no romper datos existentes)
    private static final String CLAVE_SECRETA = System.getenv().getOrDefault(
            "APP_ENCRYPTION_KEY",
            System.getProperty("app.encriptacion.clave", "OficinaSecret123")
    );
    private static final String ALGORITMO = "AES";

    private static SecretKeySpec obtenerLlave() {
        byte[] keyBytes = CLAVE_SECRETA.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, ALGORITMO);
    }

    public static String encriptar(String texto) {
        if (texto == null || texto.trim().isEmpty()) return texto;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.ENCRYPT_MODE, obtenerLlave());
            byte[] bytesEncriptados = cipher.doFinal(texto.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytesEncriptados);
        } catch (Exception e) {
            throw new RuntimeException("Error al encriptar dato", e);
        }
    }

    public static String desencriptar(String textoEncriptado) {
        if (textoEncriptado == null || textoEncriptado.trim().isEmpty()) return textoEncriptado;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.DECRYPT_MODE, obtenerLlave());
            byte[] bytesDecodificados = Base64.getDecoder().decode(textoEncriptado);
            return new String(cipher.doFinal(bytesDecodificados), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error al desencriptar dato", e);
        }
    }
}