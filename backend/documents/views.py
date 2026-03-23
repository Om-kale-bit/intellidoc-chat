from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Document
from .rag import process_document, delete_document_collection
import os


class DocumentUploadView(APIView):

    def get(self, request):
        documents = Document.objects.all().order_by('-uploaded_at')
        data = [{'id': d.id, 'name': d.name, 'processed': d.is_processed,
                 'uploaded_at': d.uploaded_at} for d in documents]
        return Response(data)

    def post(self, request):
        file = request.FILES.get('file')

        if not file:
            return Response({'error': 'No file provided'}, status=400)

        allowed = ['.pdf', '.docx', '.txt']
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in allowed:
            return Response({'error': 'Only PDF, DOCX, TXT files allowed'}, status=400)

        document = Document.objects.create(name=file.name, file=file)

        try:
            file_path = os.path.join(settings.MEDIA_ROOT, document.file.name)
            chunk_count = process_document(document.id, file_path)
            document.is_processed = True
            document.save()

            return Response({
                'id': document.id,
                'name': document.name,
                'chunks': chunk_count,
                'processed': True,
                'message': f'Document processed into {chunk_count} chunks'
            }, status=201)

        except Exception as e:
            document.delete()
            return Response({'error': str(e)}, status=500)


class DocumentDeleteView(APIView):

    def delete(self, request, pk):
        try:
            document = Document.objects.get(id=pk)

            # Delete from ChromaDB vector store
            try:
                delete_document_collection(pk)
            except Exception:
                pass  # ignore if collection doesn't exist

            # Delete the actual file from disk
            file_path = os.path.join(settings.MEDIA_ROOT, document.file.name)
            if os.path.exists(file_path):
                os.remove(file_path)

            # Delete from database
            document.delete()

            return Response({'message': 'Document deleted'}, status=200)

        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=404)