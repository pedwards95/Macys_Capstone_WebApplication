from flask_wtf import FlaskForm
from wtforms import StringField, FloatField, BooleanField, IntegerField, RadioField, SelectField
from wtforms.validators import InputRequired, Optional, Email

# class AddSnackForm(FlaskForm):
#     term = StringField("Snack Name")
#     price = FloatField("Price in USD")
#     quantity = IntegerField("How Many?")
#     is_healthy = BooleanField("This is a healthy snack")
#     category = SelectField("Category", choices=[('ic','Ice Cream'), ('chips','Potato Chips'), ('candy','Candy/Sweets')])

# class UserForm(FlaskForm):
#     term = StringField("Name", validators=[InputRequired()])
#     email = StringField("Email Address", validators=[Optional(), Email()])
