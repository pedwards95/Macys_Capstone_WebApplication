# python -m venv venv
# source venv/Scripts/activate

# pip freeze > requirements.txt

#    flask run


from flask import Flask, request, render_template, redirect, flash, session
from flask_sqlalchemy import SQLAlchemy
import requests
from applicationinsights.flask.ext import AppInsights
from models.helpers.functions import writeLog

# create app
app = Flask(__name__)

# insights for logging on azure side
appinsights = AppInsights(app)

# logging for local side
writeLog("Logging started.",app)

writeLog("Configuring app...",app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
writeLog("App configured.",app)


# home page route
@app.route("/")
def home_page():
    writeLog("Received call to home page.",app)
    return render_template("home.html")

# searchroute. Takes in arguments from query, forwards to api, returns response
@app.route("/search", methods=['GET'])
def search_endpoint():
    writeLog("Received call search.",app)
    terms = request.args["terms"]
    sort = request.args["sort"]
    writeLog("Sending request to api...",app)
    res = requests.get(f"https://macyitemapi-pde.azurewebsites.net/items/search?words={terms}").json()
    writeLog("Received response from api.",app)

    return render_template("select_item.html",items=res)

# shows basic map with no routing
@app.route("/map", methods=['GET'])
def show_map():
    writeLog("Received call for map.",app)
    return render_template("map.html")

# shows map with routing, must select one of the return items after a search
@app.route("/map/<int:section>", methods=['GET'])
def navigate_map(section):
    client_ips = request.headers.getlist("X-Forwarded-For")
    writeLog("Received call to navigate on map.",app)
    return render_template("map.html",destination=section,ip=client_ips)