from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import StudentDocument

# Remove the physical file from storage whenever a StudentDocument row is deleted
# (single delete, deleting a student, or bulk delete).
@receiver(post_delete, sender=StudentDocument)
def delete_document_file(sender, instance, **kwargs):
  
    if not instance.file:
        return

    storage = instance.file.storage
    name = instance.file.name

    def _remove():
        try:
            storage.delete(name)
        except Exception:
            # Never break the request because a file was already missing.
            pass

    # Only delete the file once the DB delete has actually been committed.
    transaction.on_commit(_remove)