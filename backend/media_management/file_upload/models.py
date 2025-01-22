from django.db import models

class File(models.Model):
    file = models.FileField(upload_to='uploads/')
    file_name = models.CharField(max_length=255)  # Store the file name
    file_size = models.IntegerField()  # Store the file size
    file_type = models.CharField(max_length=50)  # Store the file extension
    category = models.CharField(max_length=50)  # Store the category (image, audio, video)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name
