from django.shortcuts import render
from django.http import HttpResponseNotFound, HttpResponse, Http404


def index(request):
    return render(request, "game.html")


def register(request):

    scoreArg = request.GET.get("score")

    if scoreArg is None:
        return HttpResponseNotFound("Not Found")

    try:
        score = int(scoreArg)
    except ValueError:
        raise Http404

    return render(request, 'register.html', {'score': score})
