# media_project/views.py
from django.http import HttpResponse

def home(request):
    return HttpResponse("hello world")
