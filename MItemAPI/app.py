# python -m venv venv
# source venv/Scripts/activate

# pip freeze > requirements.txt

#    flask run
# if app is not named app.py, use :
#    FLASK_APP=app_name.py flask run

from flask import Flask, request, render_template, redirect, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from models.database import db, connect_db, Item, Section
from models.helpers.functions import makeItemListToDict
from seed import seed

app = Flask(__name__)
app.config['SECRET_KEY']="mykey"
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///item_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

my_db = connect_db(app)
seed(my_db)

@app.route("/")
def home_page():
    return jsonify({"server":"connected"});

@app.route("/items")
def get_all_items():
    items = Item.query.all()
    return jsonify(makeItemListToDict(items))

@app.route("/items/search")
def get_specific_items():
    words = request.args["words"].split(",")
    items=[]
    for word in words:
        res = Item.query.filter(Item.item_type.ilike(f"%{word}%")).all()
        for item in res:
            items.append(item);
    return jsonify(makeItemListToDict(items))