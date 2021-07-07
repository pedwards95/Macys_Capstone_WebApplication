from models.database import Item, Section

def seed(my_db):
    "Simple seeding template"
    my_db.drop_all()
    my_db.create_all()

    Item.query.delete()
    Section.query.delete()

    s1 = Section(section_name="Mens", section_number="1")
    s2 = Section(section_name="Womens", section_number="2")
    s3 = Section(section_name="Childrens", section_number="3")

    my_db.session.add(s1)
    my_db.session.add(s2)
    my_db.session.add(s3)

    my_db.session.commit()

    i1 = Item(item_type="Suit",brand_name="Mine",section_id=1)
    i2 = Item(item_type="Dress",brand_name="Mine",section_id=2)
    i3 = Item(item_type="Jacket",brand_name="Mine",section_id=3)

    my_db.session.add(i1)
    my_db.session.add(i2)
    my_db.session.add(i3)

    my_db.session.commit()
