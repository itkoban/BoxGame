from django.shortcuts import render
from django.http import HttpResponseNotFound, HttpResponse, Http404, JsonResponse
import time
import hashlib

HASH = hashlib.sha256()
REGISTERED_HASES = []
SAVED_SCORE = {}


def index(request):
    return render(request, "game.html")


def register(request):

    scoreArg = request.GET.get("score")
    clientHash = request.GET.get("hash")

    if scoreArg is None or clientHash is None:
        return HttpResponseNotFound("Not Found")

    try:
        score = int(scoreArg)
    except ValueError:
        raise Http404

    if clientHash in SAVED_SCORE:
        score = SAVED_SCORE[clientHash]
    else:
        SAVED_SCORE[clientHash] = score

    return render(request, 'register.html', {'score': score, 'hash': clientHash})


def registerData(request):
    # получаем из строки запроса имя пользователя
    score = request.POST.get("score", 0)
    clientHash = request.POST.get("hash", 0)
    phone = request.POST.get("phone", "")
    email = request.POST.get("email", "")
    fullName = request.POST.get("fullName", "")
    company = request.POST.get("company", "")
    position = request.POST.get("position", "")
    agreement = request.POST.get("agreement", False)
    langs = request.POST.getlist("languages", ["python"])

    if clientHash in REGISTERED_HASES:
        REGISTERED_HASES.remove(clientHash)
        score = SAVED_SCORE[clientHash]
        SAVED_SCORE.pop(clientHash)
    else:
        return HttpResponseNotFound("Not Found")

    return HttpResponse(f"""
                <div>score: {score} phone: {phone} email: {email} fullName: {fullName} company: {company} position: {position} agreement: {agreement}</div>
                <div>Languages: {langs}</div>
            """)


def getCode(request):
    HASH.update(float.hex(time.time()).encode('utf-8'))
    currentHash = HASH.hexdigest()
    REGISTERED_HASES.append(currentHash)
    return JsonResponse({"hash": currentHash})


def checkCode(request):
    clientHash = request.GET.get("hash")

    isValidated = False
    if clientHash and clientHash in REGISTERED_HASES:
        isValidated = True

    return JsonResponse({"isValidated": isValidated})
