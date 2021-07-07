def makeItemListToDict(listOfItems):
    returnItems = {}
    for item in listOfItems:
        returnItems[f"{item.id}"] = {
            "item_type":item.item_type,
            "brand_name":item.brand_name,
            "section":{
                "section_number":item.section.section_number,
                "section_name":item.section.section_name
            }
        }
    return returnItems