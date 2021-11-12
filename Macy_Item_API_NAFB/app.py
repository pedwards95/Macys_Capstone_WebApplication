# python -m venv venv
# source venv/Scripts/activate
# pip install -r requirements.txt
# ...
# pip freeze > requirements.txt

#    flask run

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
import base64

# create app
app = Flask(__name__)

# insight for azure logging
appinsights = AppInsights(app)

# local logger for development
writeLog("Logging started.",app)

writeLog("Configuring server...",app)

# unimportant key, but app requires it.
# should be moved into secret key and passed in
app.config['SECRET_KEY']="mykey" 

print(MODE)

# sets database source based on test/development/production  .. set in config file
# this info should ideally be in encrypted pass-in data, such as secret keys in managed env
# for now, and for demo, is just garbled
if(MODE == "DEVELOPMENT"):  
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///item_db'
elif(MODE == "PRODUCTION"): 
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}/{dbname}'.format(
        dbuser="adminpg@macyitemapi-pde",
        dbpass= (base64.b64decode(b'U21va2V5c21va2V5MQ=='.decode())).decode(),
        dbhost="macyitemapi-pde.postgres.database.azure.com",
        dbname="item_db"
    )
elif(MODE == "TEST"): 
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///item_db_test'
app.config.update(SQLALCHEMY_TRACK_MODIFICATIONS=False)
app.config['SQLALCHEMY_ECHO'] = True
app.config['APPINSIGHTS_INSTRUMENTATIONKEY'] = "13d8ab5c-3c40-4cb0-904f-831c6239480d"
writeLog("Server Configured.",app)

# connect to db
writeLog("Connecting database...",app)
my_db = connect_db(app)

# seeding only needs to happen if fresh db. no way to write to it at the moment.
# seed(my_db)

writeLog("Database connected.",app)

# force flushing application insights handler after each request
@app.after_request
def after_request(response):
    appinsights.flush()
    return response



# home route just to confirm app is working
@app.route("/")
def home_page():
    writeLog("Returning homepage.",app)
    return jsonify({"server":"connected"})

# fetches all items
@app.route("/items")
def get_all_items():
    writeLog("Fetching all items.",app)
    items = Item.query.all()
    return jsonify(makeItemListToDict(items))

# searches for items based on keywords
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

    