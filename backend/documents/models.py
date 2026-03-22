from django.db import models

class Document(models.Model):
    """Stores info about each uploaded file"""
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)  # True after embedding is done

    def __str__(self):
        return self.name