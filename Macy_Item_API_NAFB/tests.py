#python -m unittest tests.py

from unittest import TestCase

from app import app
from models.database import db, Item, Section

# Use test database and don't clutter tests with SQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///item_db_test'
app.config['SQLALCHEMY_ECHO'] = False

# Make Flask errors be real errors, rather than HTML pages with error info
app.config['TESTING'] = True

# This is a bit of hack, but don't use Flask DebugToolbar
app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

# Don't req CSRF for testing
app.config['WTF_CSRF_ENABLED'] = False

class MacyViewsTestCase(TestCase):
    """Tests for the Macy Item API."""

    def setUp(self):
        """Make demo data."""

        db.drop_all()
        db.create_all()

        Item.query.delete()
        Section.query.delete()
        db.session.commit()

        section = Section(section_name="Mens", section_number="1")
        db.session.add(section)
        db.session.commit()

        item = Item(item_type="Suit",brand_name="Mine",section_id=1)
        item2 = Item(item_type="Dress",brand_name="Hers",section_id=1)
        db.session.add(item)
        db.session.add(item2)
        db.session.commit()

        self.item_id = item.id
        self.section_id = section.id

    def tearDown(self):
        """Clean up fouled transactions."""

        db.session.rollback()

    def test_home(self):
        with app.test_client() as client:
            resp = client.get("/")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)

            self.assertEqual(resp.json,
                {"server":"connected"})

    def test_all_items(self):
        with app.test_client() as client:
            resp = client.get("/items")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            print(resp.json)

            self.assertEqual(resp.json,
                {'1': 
                    {'brand_name': 'Mine',
                    'item_type': 'Suit',
                    'section': 
                        {'section_name': 'Mens', 
                        'section_number': 1}
                    }
                ,
                '2': 
                    {'brand_name': 'Hers',
                    'item_type': 'Dress',
                    'section': 
                        {'section_name': 'Mens', 
                        'section_number': 1}
                    }
                })

    def test_search(self):
        with app.test_client() as client:
            resp = client.get("/items/search?words=suit")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)

            self.assertEqual(resp.json,
                {'1': 
                    {'brand_name': 'Mine',
                    'item_type': 'Suit',
                    'section': 
                        {'section_name': 'Mens', 
                        'section_number': 1}
                    }
                })


        
            
