from django.db import models

# Create your models here.


class ScoreModel(models.Model):
    hashCode = models.CharField()
    score = models.IntegerField()