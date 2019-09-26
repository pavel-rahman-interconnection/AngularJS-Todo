from django.shortcuts import render
from rest_framework import viewsets
from . import models
from . import serializers

# Create your views here.
class EmployeeView(viewsets.ModelViewSet):
    queryset = models.Employee.objects.all()
    serializer_class = serializers.EmployeeSerializer