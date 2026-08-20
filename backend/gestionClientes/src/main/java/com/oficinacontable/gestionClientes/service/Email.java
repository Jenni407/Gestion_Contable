package com.oficinacontable.gestionClientes.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class Email {

    @Autowired
    private JavaMailSender mailSender;

    private static final String REMITENTE = "soporte.tecnico.gt058@gmail.com";

    @Value("${app.portal.url}")
    private String urlConsulta;

    public void enviarCodigoRecuperacion(String correoDestino, String codigo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(REMITENTE);
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

    public void enviarNotificacionDeclaracion(String correoDestino, String nombreCliente, String nit, String tipoImpuesto, String periodo, String numeroFormulario) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(REMITENTE);
            helper.setTo(correoDestino);
            helper.setSubject("Declaración Presentada Exitosamente - NIT: " + nit);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%%, #1d4ed8 100%%); padding: 25px; text-align: center; color: white;">
                        <h2 style="margin: 0; font-size: 20px;">📄 Declaración Presentada</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Comprobante de presentación de impuestos</p>
                    </div>
                    <div style="padding: 25px;">
                        <p style="font-size: 14px; color: #334155;">Estimado/a <strong>%s</strong>,</p>
                        <p style="font-size: 14px; color: #334155;">Se ha realizado exitosamente la presentación de su declaración correspondiente al período indicado:</p>
                        
                        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 15px; margin: 20px 0;">
                            <table style="width: 100%%; font-size: 13px; color: #334155;">
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">NIT:</td>
                                    <td style="text-align: right;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Régimen / Impuesto:</td>
                                    <td style="text-align: right;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Período:</td>
                                    <td style="text-align: right;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">No. Formulario:</td>
                                    <td style="text-align: right;">%s</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 25px;">
                            <a href="%s" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                                🔍 Consultar Mis Declaraciones
                            </a>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; margin-top: 20px; text-align: center;">No es necesario autenticarse. Ingrese su NIT y el número de teléfono registrado en el portal para ver su reporte completo.</p>
                    </div>
                </div>
            """.formatted(nombreCliente, nit, tipoImpuesto, periodo, numeroFormulario, urlConsulta + "/consulta");

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println(">>> Notificación de declaración enviada a: " + correoDestino);
        } catch (Exception e) {
            System.err.println(">>> ERROR AL ENVIAR CORREO DE DECLARACIÓN:");
            e.printStackTrace();
        }
    }
}