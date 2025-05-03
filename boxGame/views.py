from django.http import HttpResponse, Http404
from django.shortcuts import render
from django.template import loader
from django.template.exceptions import TemplateDoesNotExist

def index(request):

    return render(request, "game.html")


def about(request, name, age):
    return HttpResponse(f"""
            <h2>О пользователе</h2>
            <p>Имя: {name}</p>
            <p>Возраст: {age}</p>
    """)


def contact(request):
    return HttpResponse("Контакты")