import json

# simple function for writting to the console log, but only in development mode
def writeLog(log: str, app, type="info"):
    with open('static/config.json') as file:
        data = json.load(file)
        if(data["MODE"] == "DEVELOPMENT"):
            app.logger.info(log)