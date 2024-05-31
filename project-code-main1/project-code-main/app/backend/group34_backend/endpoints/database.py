from flask_app import app
from group34_backend.database.insert import *

@app.get('/api/database', description="Repopulates the stadiums database with updated information.")
def populate_database():
    try:
        results = gather_results()
        insert_data(results)
        return "success"
    except Exception as e:
        app.logger.error(e)
        return "fail", 400
