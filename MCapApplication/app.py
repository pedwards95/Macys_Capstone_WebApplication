# python -m venv venv
# source venv/Scripts/activate
# pip install pylint
# pip install ipython
# pip install flask
# pip install flask-wtf
# pip install flask_debugtoolbar
# pip install pylint-flask
# pip install psycopg2-binary
# pip install flask-sqlalchemy
# pip install pylint-sqlalchemy
# pip install pylint_flask_sqlalchemy
# pip install sqlalchemy-utils
# pip install python-dotenv
#    then make a .flaskenv in root directory
# pip install email_validator

# pip freeze > requirements.txt

#    flask run
# if app is not named app.py, use :
#    FLASK_APP=app_name.py flask run

from flask import Flask, request, render_template, redirect, flash, session
from flask_sqlalchemy import SQLAlchemy
from models.database import db, connect_db

app = Flask(__name__)
app.config['SECRET_KEY']="mykey"
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///user_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

connect_db(app)

@app.route("/")
def home_page():
    return render_template("home.html");

@app.route("/search", methods=['GET'])
def search_endpoint():
    term = request.args["term"];
    sort = request.args["sort"];

@app.route("/map", methods=['GET'])
def show_map():
    return render_template("map.html");