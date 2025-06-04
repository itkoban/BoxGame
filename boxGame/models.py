from django.db import models

# Create your models here.


class ScoreModel(models.Model):
    hashCode = models.CharField()
    score = models.IntegerField()


class GamerModel(models.Model):
    phone = models.CharField()
    email = models.CharField()
    fullName = models.CharField()
    company = models.CharField()
    position = models.CharField()
    score = models.IntegerField()
