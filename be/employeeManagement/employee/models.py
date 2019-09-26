from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=254)
    sex = models.CharField(max_length=1)

    def __str__(self):
        return self.name
