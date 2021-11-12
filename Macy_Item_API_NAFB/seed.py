from models.database import Item, Section
import random

def seed(my_db):
    "Simple seeding template"

    my_db.drop_all()
    my_db.create_all()

    Item.query.delete()
    Section.query.delete()

    wordArray = ["Lorem", "ipsum", "dolor", "amet", "consectetur", "adipiscing", "donec", "vitae", "augue", "porttitor", "pellentesque", "fermentum", "nulla", "morbi", "at porta",
        "Lorem ipsum","ipsum Lorem","placeholder text","Excepteur", "sint occaecat", "cupidatat non proident", "sunt in culpa", "qui officia deserunt mollit", "anim id est laborum"]

    sectionsMade = 3
    s1 = Section(section_name="Mens", section_number="1")
    s2 = Section(section_name="Womens", section_number="2")
    s3 = Section(section_name="Childrens", section_number="3")

    while sectionsMade < 31:
        sectionsMade += 1
        num = random.randrange(len(wordArray))
        section = Section(section_name=f"{wordArray[num]}", section_number=f"{sectionsMade}")
        my_db.session.add(section)

    my_db.session.add(s1)
    my_db.session.add(s2)
    my_db.session.add(s3)

    my_db.session.commit()

    itemsMade = 3
    i1 = Item(item_type="Suit",brand_name="Mine",section_id=1)
    i2 = Item(item_type="Dress",brand_name="Mine",section_id=2)
    i3 = Item(item_type="Jacket",brand_name="Mine",section_id=3)

    while itemsMade < 31:
        itemsMade += 1
        num1 = random.randrange(len(wordArray))
        num2 = random.randrange(len(wordArray))
        item = Item(item_type=f"{wordArray[num1]}",brand_name=f"{wordArray[num2]}", section_id=itemsMade)
        my_db.session.add(item)

    my_db.session.add(i1)
    my_db.session.add(i2)
    my_db.session.add(i3)

    my_db.session.commit()

    itemsMade = 0
    looped = 0
    while itemsMade < 50 and looped < 5:
        itemsMade += 1
        num1 = random.randrange(len(wordArray))
        num2 = random.randrange(len(wordArray))
        num3 = random.randrange(31)+1
        item = Item(item_type=f"{wordArray[num1]}",brand_name=f"{wordArray[num2]}", section_id=num3)
        my_db.session.add(item)
        if(itemsMade == 31):
            itemsMade = 0
            looped += 1

    my_db.session.commit()

    item1 = Item(item_type=f"Crocodile Leather Dress Shoes",brand_name=f"Gucci", section_id=20)
    item2 = Item(item_type=f"Cross Stitch Handbag",brand_name=f"Louis Vuitton", section_id=18)
    item3 = Item(item_type=f"Natural Radiant Longwear Foundation",brand_name=f"NARS", section_id=19)

    my_db.session.add(item1)
    my_db.session.add(item2)
    my_db.session.add(item3)

    my_db.session.commit()
        
