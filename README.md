# Macys_Capstone_WebApplication

- I will have my own API of USER and another of ITEM
    - They will be hosted on a cloud server, seperately
    - ITEM will return JSON
    - USER will only return authorization tokens, and previous search information, as it is only needed for recomendations or admin

- I will use Google geolocation API for navigation, BUT the app will be in 'demo' mode if it detects you outside of the store

- Item
    - Type
    - Brand
    - Location (exact)
    - Section

- User
    - email
    - password
    - ARRAY [past searches]

These models will be broken apart to be in 3rd normal form.

The main app will function as an MVC model, providing the endpoints, the controller, and the data intrapolation. 

Note: User does NOT need to log in to use this app. Searches and recomendations are only used if logged in.