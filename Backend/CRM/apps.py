from django.apps import AppConfig

class CrmConfig(AppConfig):
    name = 'CRM'

    def ready(self):
        from CRM import signals  