# python -m venv venv
# source venv/Scripts/activate

# pip freeze > requirements.txt

#    flask run
# if app is not named app.py, use :
#    FLASK_APP=app_name.py flask run

import json
with open('static/config.json') as file:
        data = json.load(file)
        MODE = data["MODE"]

from flask import Flask, request, render_template, redirect, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from models.database import connect_db, Item, Section
from models.helpers.functions import makeItemListToDict, writeLog
from seed import seed
from applicationinsights.flask.ext import AppInsights

app = Flask(__name__)
appinsights = AppInsights(app)
writeLog("Logging started.",app)

writeLog("Configuring server...",app)
app.config['SECRET_KEY']="mykey" 
print(MODE)
if(MODE == "DEVELOPMENT"):  
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///item_db'
    seed(my_db)
elif(MODE == "PRODUCTION"): 
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}/{dbname}'.format(
        dbuser="adminpg@macyitemapi-pde",
        dbpass="Smokeysmokey1",
        dbhost="macyitemapi-pde.postgres.database.azure.com",
        dbname="item_db"
    )
elif(MODE == "TEST"): 
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///item_db_test'
app.config.update(SQLALCHEMY_TRACK_MODIFICATIONS=False)
app.config['SQLALCHEMY_ECHO'] = True
app.config['APPINSIGHTS_INSTRUMENTATIONKEY'] = "13d8ab5c-3c40-4cb0-904f-831c6239480d"
writeLog("Server Configured.",app)


writeLog("Connecting database...",app)
my_db = connect_db(app)
# seed(my_db)
writeLog("Database connected.",app)

# force flushing application insights handler after each request
@app.after_request
def after_request(response):
    appinsights.flush()
    return response




@app.route("/")
def home_page():
    writeLog("Returning homepage.",app)
    return jsonify({"server":"connected"})

@app.route("/items")
def get_all_items():
    writeLog("Fetching all items.",app)
    items = Item.query.all()
    return jsonify(makeItemListToDict(items))

@app.route("/items/search")
def get_specific_items():
    writeLog("Searching for items.",app)
    words = request.args["words"].split(",")
    items=[]
    for word in words:
        res = Item.query.filter(Item.item_type.ilike(f"%{word}%")).all()
        for item in res:
            items.append(item)
    return jsonify(makeItemListToDict(items))