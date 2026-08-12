package com.oficinacontable.gestionClientes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class Email {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarCodigoRecuperacion(String correoDestino, String codigo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom("soporte.tecnico.gt058@gmail.com");
        mensaje.setTo(correoDestino);
        mensaje.setSubject("Código de Recuperación de Contraseña");
        mensaje.setText("Tu código de verificación es: " + codigo + "\n\nVence en 15 minutos.");

        mailSender.send(mensaje);
    }
}