from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'accounts'

    def ready(self):
        # Registers the login-time signal for the fixed 24hr timeout.
        from . import session_timeout  