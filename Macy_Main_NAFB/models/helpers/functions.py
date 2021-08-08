import json

def writeLog(log: str, app, type="info"):
    with open('static/config.json') as file:
        data = json.load(file)
        if(data["MODE"] == "DEVELOPMENT"):
            app.logger.info(log)