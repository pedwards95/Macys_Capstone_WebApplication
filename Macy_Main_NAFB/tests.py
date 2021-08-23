from unittest import TestCase

from app import app

# Make Flask errors be real errors, rather than HTML pages with error info
app.config['TESTING'] = True

class MacyViewsTestCase(TestCase):
    """Tests for views related to the main Macy pages."""

    def test_home(self):
        with app.test_client() as client:
            resp = client.get("/")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertIn("<h1>Welcome to the Macy's app!</h1>", html)

    def test_search(self):
        with app.test_client() as client:
            resp = client.get("/search?terms=suit&sort=0")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertIn("Suit", html)

    def test_map_basic(self):
        with app.test_client() as client:
            resp = client.get("/map")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertIn('<div id="map_container">', html)
            self.assertNotIn('<meta id="my-data" data-destination=', html)


    def test_map_navigating(self):
        with app.test_client() as client:
            resp = client.get("/map/1")
            html = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertIn('<meta id="my-data" data-destination=', html)
            
