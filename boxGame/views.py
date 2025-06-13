from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound, HttpResponse, Http404, JsonResponse
from .models import ScoreModel, GamerModel

import time
import hashlib
import json


HASH = hashlib.sha256()
KEY_TO_GAMERS = 'yourkey'

LOGIN_GAME = "gamer"
PASSWORD_GAME = "gamer"


def index(request):
    return render(request, "gameLogin.html")


def tryLogin(request):
    if request.method != "POST":
        return HttpResponseNotFound("Not Found")

    login = request.POST.get("login", "")
    password = request.POST.get("password", "")

    if login != LOGIN_GAME or password != PASSWORD_GAME:
        return HttpResponseNotFound("Not Found")

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
    if request.method != "POST":
        return HttpResponseNotFound("Not Found")

    clientHash = request.POST.get("hash", "")
    phone = request.POST.get("phone", "")
    email = request.POST.get("email", "")
    fullName = request.POST.get("fullName", "")
    company = request.POST.get("company", "")
    position = request.POST.get("position", "")
    agreement = request.POST.get("agreement", False)

    try:
        scoreInDB = ScoreModel.objects.get(hashCode=clientHash)
    except ScoreModel.DoesNotExist:
        scoreInDB = None

    if not scoreInDB:
        return HttpResponseNotFound("Not Found")
    else:
        score = scoreInDB.score
        scoreInDB.delete()

    try:
        gamerData = GamerModel.objects.get(phone=phone)
    except GamerModel.DoesNotExist:
        gamerData = GamerModel()
        gamerData.phone = phone
        gamerData.email = email
        gamerData.fullName = fullName
        gamerData.company = company
        gamerData.position = position

    oldScore = gamerData.score if gamerData.score else 0

    gamerData.score = max(score, oldScore)
    gamerData.save()

    return render(request, "thanks.html")


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


def getAllGamers(request):
    key = request.GET.get("key")

    if key is None or key != KEY_TO_GAMERS:
        return HttpResponseNotFound("Not Found")

    resultArray = []

    for gamerData in GamerModel.objects.all():
        resultArray.append({
            'Phone': gamerData.phone,
            'Score': gamerData.score,
            'email': gamerData.email,
            'FullName': gamerData.fullName,
            'Company': gamerData.company,
            'Position': gamerData.position
        })

    return JsonResponse(resultArray, safe=False, json_dumps_params={'ensure_ascii': False})
