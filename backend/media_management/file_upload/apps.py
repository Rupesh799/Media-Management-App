from django.apps import AppConfig
import mimetypes

class UploadFileConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'file_upload'


def ready(self):
        configure_mimetypes()

def configure_mimetypes():
    mimetypes.add_type("audio/mpeg", ".mp3", True)
    mimetypes.add_type("audio/x-m4a", ".m4a", True)
    mimetypes.add_type("video/mp4", ".mp4", True)
    mimetypes.add_type("video/webm", ".webm", True)
    mimetypes.add_type("image/png", ".png", True)
    mimetypes.add_type("image/jpeg", ".jpg", True)