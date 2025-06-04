from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound, HttpResponse, Http404, JsonResponse
from .models import ScoreModel

import time
import hashlib
import json


HASH = hashlib.sha256()


def index(request):
    return render(request, "game.html")


def register(request):

    clientHash = request.GET.get("hash")

    if clientHash is None:
        return HttpResponseNotFound("Not Found")

    try:
        scoreInDB = ScoreModel.objects.get(hashCode=clientHash)
    except ScoreModel.DoesNotExist:
        scoreInDB = None

    if not scoreInDB:
        return HttpResponseNotFound("Not Found")

    score = scoreInDB.score

    return render(request, 'register.html', {'score': score, 'hash': clientHash})


def registerData(request):
    # получаем из строки запроса имя пользователя
    clientHash = request.POST.get("hash", "")
    phone = request.POST.get("phone", "")
    email = request.POST.get("email", "")
    fullName = request.POST.get("fullName", "")
    company = request.POST.get("company", "")
    position = request.POST.get("position", "")
    agreement = request.POST.get("agreement", False)
    langs = request.POST.getlist("languages", ["python"])

    score = 0

    try:
        scoreInDB = ScoreModel.objects.get(hashCode=clientHash)
    except ScoreModel.DoesNotExist:
        scoreInDB = None

    if not scoreInDB:
        return HttpResponseNotFound("Not Found")
    else:
        score = scoreInDB.score
        scoreInDB.delete()

    return HttpResponse(f"""
                <div>score: {score} phone: {phone} email: {email} fullName: {fullName} company: {company} position: {position} agreement: {agreement}</div>
                <div>Languages: {langs}</div>
            """)


def setScore(request):
    if request.method == "POST":

        data = json.loads(request.body)

        score = data.get("score", None)
        clientHash = data.get("hash", None)

        if clientHash is None or score is None:
            return HttpResponseNotFound("Not Found")

        try:
            scoreInDB = ScoreModel.objects.get(hashCode=clientHash)
        except ScoreModel.DoesNotExist:
            scoreInDB = None

        if scoreInDB:
            scoreInDB.score = score
            scoreInDB.save()

    return JsonResponse({"status": "success"})


def getCode(request):
    HASH.update(float.hex(time.time()).encode('utf-8'))
    currentHash = HASH.hexdigest()

    scoreInDB = ScoreModel()
    scoreInDB.hashCode = currentHash
    scoreInDB.score = 0
    scoreInDB.save()

    return JsonResponse({"hash": currentHash})
