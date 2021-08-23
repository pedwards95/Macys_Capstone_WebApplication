# python -m venv venv
# source venv/Scripts/activate

# pip freeze > requirements.txt

#    flask run
# if app is not named app.py, use :
#    FLASK_APP=app_name.py flask run

from flask import Flask, request, render_template, redirect, flash, session
from flask_sqlalchemy import SQLAlchemy
import requests
from applicationinsights.flask.ext import AppInsights
from models.helpers.functions import writeLog

app = Flask(__name__)
appinsights = AppInsights(app)
writeLog("Logging started.",app)

writeLog("Configuring app...",app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
writeLog("App configured.",app)


@app.route("/")
def home_page():
    writeLog("Received call to home page.",app)
    return render_template("home.html")

@app.route("/search", methods=['GET'])
def search_endpoint():
    writeLog("Received call search.",app)
    terms = request.args["terms"]
    sort = request.args["sort"]
    writeLog("Sending request to api...",app)
    res = requests.get(f"https://macyitemapi-pde.azurewebsites.net/items/search?words={terms}").json()
    writeLog("Received response from api.",app)

    return render_template("select_item.html",items=res)

@app.route("/map", methods=['GET'])
def show_map():
    writeLog("Received call for map.",app)
    return render_template("map.html")

@app.route("/map/<int:section>", methods=['GET'])
def navigate_map(section):
    writeLog("Received call to navigate on map.",app)
    return render_template("map.html",destination=section)