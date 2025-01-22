from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import File
from .serializers import FileSerializer
import os


FILE_CATEGORIES = {
    'image': ['jpg', 'jpeg', 'png', 'gif'],
    'audio': ['mp3', 'm4a', 'wav'],
    'video': ['mp4', 'webm'],
}

MIME_TYPE_CATEGORIES = {
    'image': ['image/jpeg', 'image/png', 'image/gif'],
    'audio': ['audio/mpeg'],
    'video': ['video/mp4'],
}

class UploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        files = request.FILES.getlist('file') 

        if not files:
            return Response({'error': 'No files uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_files = []
        
        for uploaded_file in files:
            
            file_name = uploaded_file.name
            file_size = uploaded_file.size
            file_extension = os.path.splitext(file_name)[1][1:].lower()  
            mime_type = uploaded_file.content_type  

            # Validating MIME type
            category = 'other'  
            for cat, extensions in FILE_CATEGORIES.items():
                if file_extension in extensions and mime_type in MIME_TYPE_CATEGORIES.get(cat, []):
                    category = cat
                    break


            if category == 'other':
                return Response({'error': 'Invalid file type or MIME type'}, status=status.HTTP_400_BAD_REQUEST)

            file_instance = File.objects.create(
                file=uploaded_file,
                file_name=file_name,
                file_size=file_size,
                file_type=file_extension,
                category=category
            )
            uploaded_files.append(file_instance)

        serializer = FileSerializer(uploaded_files, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def get(self, request):
        files = File.objects.all()
        serializer = FileSerializer(files, many=True)
        return Response(serializer.data)

class DeleteView(APIView):
    def delete(self, request, pk):
        try:
            file = File.objects.get(pk=pk)
            file_path = file.file.path
            
            file.delete()
            
            if os.path.exists(file_path):
                os.remove(file_path)
            
            return Response({"message": "File deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except File.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)