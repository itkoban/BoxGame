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


def registerData(request):
    # получаем из строки запроса имя пользователя
    score = request.POST.get("score", 0)
    phone = request.POST.get("phone", "")
    email = request.POST.get("email", "")
    fullName = request.POST.get("fullName", "")
    company = request.POST.get("company", "")
    position = request.POST.get("position", "")
    agreement = request.POST.get("agreement", False)
    langs = request.POST.getlist("languages", ["python"])

    return HttpResponse(f"""
                <div>score: {score} phone: {phone} email: {email} fullName: {fullName} company: {company} position: {position} agreement: {agreement}</div>
                <div>Languages: {langs}</div>
            """)