package com.oficinacontable.gestionClientes.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class Email {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarCodigoRecuperacion(String correoDestino, String codigo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("soporte.tecnico.gt058@gmail.com");
            helper.setTo(correoDestino);
            helper.setSubject("Código de Recuperación de Contraseña");

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 450px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); padding: 25px; text-align: center; color: white;">
                        <h2 style="margin: 0;">🔐 Recuperación de Contraseña</h2>
                    </div>
                    <div style="padding: 25px; background-color: #ffffff;">
                        <p style="font-size: 14px; color: #334155;">Tu código de verificación es:</p>
                        <div style="background: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; color: #0f172a; letter-spacing: 6px;">
                            %s
                        </div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 15px; text-align: center;">Este código vence en 15 minutos.</p>
                    </div>
                </div>
            """.formatted(codigo);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println(">>> Correo enviado exitosamente a: " + correoDestino);
        } catch (Exception e) {
            System.err.println(">>> ERROR AL ENVIAR CORREO:");
            e.printStackTrace();
            throw new RuntimeException("Error al enviar el correo. Revisa la configuración SMTP.");
        }
    }
}