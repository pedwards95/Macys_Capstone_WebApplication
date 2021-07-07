from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def connect_db(app):
    db.app = app
    db.init_app(app)
    return db

class Section(db.Model):
    """Section model"""

    __tablename__ = "sections"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    section_name = db.Column(db.Text, nullable=True)
    section_number = db.Column(db.Integer, nullable=False, unique=True)

    def __repr__(self):
        return f"<Section {self.section_name}>"

class Item(db.Model):
    """Item model"""

    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_type = db.Column(db.Text, nullable=False)
    brand_name = db.Column(db.Text, nullable=False)
    size = db.Column(db.Integer, nullable=True)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.section_number'))
    section = db.relationship('Section', backref='items')

    def __repr__(self):
        return f"<Item {self.brand_name} {self.item_type}>"
