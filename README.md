# Macys_Capstone_WebApplication
Deployed Demo: https://macymain-pde.azurewebsites.net

*Try "lorem" for searches. Currently only dummy data! Arrow keys on keyboard move view of map if it has pathed you.*

## General
Welcome to the Macy's locator app, used to find whatever you are looking for, anywhere inside of Macy's. While it was made specifically for the Macy in Frisco, Texas, I am told that all Macy's have a similar layout, and they try to be fairly uniform. All you need to do is put what you are looking for. This could be a general style of clothing, or a specific gender or age range, or even a specific brand. The locator will search through the Macy database (currently dummy data) and find a list of items that may match what you are looking for. Select one, and the app will guide you to the section where it can be found.

Note: User does NOT need to log in to use this app. Searches and recomendations are only used if logged in.

## Technical
This Flask app is based on a series of API's working together, and serves up data through Jinja tempates. On a search, the application comunicates with another Flask API. That api uses SQLAlchemy to search the Postgre database, and returns JSON objects with possible matches. If you select one of the matches, it attaches the section metadata to the page, and takes you to the map. When the map is pulled up, the application sends two api calls, one to check your IP, and another to check your geolocation. If either check determines you are outside of the store, you are put into 'demo mode.' Regardless of which mode you are in, the app will draw a line from 'you' to the section you are trying to get to. In demo mode, you can move the 'you are here' with a panel in the top right of the page. Pathfinding, views, and movement are all based on percentage of real world longitude and latitude, matched with percentage of the view's map image. 


### Data
- Item
    - Type
    - Brand
    - Location (exact)
    - Section

- User
    - email
    - password
    - ARRAY [past searches]

## TODO
 - Log in
 - View moves with person
 - Path updates as you move
 - Better path AI
 - More clear sections
 - Many QOL changes
