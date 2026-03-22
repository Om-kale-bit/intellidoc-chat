from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Document
from .rag import process_document
import os


class DocumentUploadView(APIView):
    """Handles file uploads from React"""

    def post(self, request):
        file = request.FILES.get('file')

        if not file:
            return Response({'error': 'No file provided'}, status=400)

        # Only allow PDF, DOCX, TXT
        allowed = ['.pdf', '.docx', '.txt']
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in allowed:
            return Response({'error': 'Only PDF, DOCX, TXT files allowed'}, status=400)

        # Save file to database
        document = Document.objects.create(name=file.name, file=file)

        # Process the document (extract, chunk, embed)
        try:
            file_path = os.path.join(settings.MEDIA_ROOT, document.file.name)
            chunk_count = process_document(document.id, file_path)
            document.is_processed = True
            document.save()

            return Response({
                'id': document.id,
                'name': document.name,
                'chunks': chunk_count,
                'message': f'Document processed successfully into {chunk_count} chunks'
            }, status=201)

        except Exception as e:
            import traceback
            traceback.print_exc()
            document.delete()
            return Response({'error': str(e)}, status=500)


    def get(self, request):
        """List all uploaded documents"""
        documents = Document.objects.all().order_by('-uploaded_at')
        data = [{'id': d.id, 'name': d.name, 'processed': d.is_processed,
                 'uploaded_at': d.uploaded_at} for d in documents]
        return Response(data)