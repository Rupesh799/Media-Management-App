from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import home 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('file_upload.urls')),
    path('', home, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
