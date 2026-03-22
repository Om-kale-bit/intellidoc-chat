from rest_framework.views import APIView
from rest_framework.response import Response
from documents.models import Document
from documents.rag import retrieve_relevant_chunks, generate_answer
from .models import ChatSession, Message


class ChatView(APIView):
    """Handles chat messages from React"""

    def post(self, request):
        document_id = request.data.get('document_id')
        session_id = request.data.get('session_id')
        user_message = request.data.get('message', '').strip()

        if not document_id or not user_message:
            return Response({'error': 'document_id and message are required'}, status=400)

        # Check document exists and is processed
        try:
            document = Document.objects.get(id=document_id, is_processed=True)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found or not yet processed'}, status=404)

        # Get or create a chat session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, document=document)
            except ChatSession.DoesNotExist:
                session = ChatSession.objects.create(document=document)
        else:
            session = ChatSession.objects.create(document=document)

        # Load chat history for context
        history = list(session.messages.values('role', 'content').order_by('created_at'))

        # Save user message
        Message.objects.create(session=session, role='user', content=user_message)

        # RAG: find relevant chunks + generate answer
        chunks = retrieve_relevant_chunks(document_id, user_message)
        answer = generate_answer(user_message, chunks, history)

        # Save assistant reply
        Message.objects.create(session=session, role='assistant', content=answer)

        return Response({
            'session_id': session.id,
            'answer': answer,
            'sources_used': len(chunks)
        })


    def get(self, request):
        """Get chat history for a session"""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({'error': 'session_id required'}, status=400)

        try:
            session = ChatSession.objects.get(id=session_id)
            messages = session.messages.all().order_by('created_at')
            data = [{'role': m.role, 'content': m.content, 'time': m.created_at} for m in messages]
            return Response({'messages': data})
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)