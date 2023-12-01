from django.core.mail import send_mail
from django.conf import settings

class ContactManager:
    def send_email(self, origin, subject, message):
        try:
            sent = send_mail(
                subject,
                f'Mensaje de {origin}:\n\n{message}',
                origin,
                [settings.EMAIL_HOST_USER],
                fail_silently=False,
            )

            if sent > 0:
                return True
            else:
                return False

        except Exception as e:
            error_message = f"Error al enviar el correo: {e}"
            print(error_message)
            return False, error_message, None


