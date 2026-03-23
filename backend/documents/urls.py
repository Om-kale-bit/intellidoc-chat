from django.urls import path
from .views import DocumentUploadView, DocumentDeleteView

urlpatterns = [
    path('', DocumentUploadView.as_view(), name='documents'),
    path('<int:pk>/', DocumentDeleteView.as_view(), name='document-delete'),
]