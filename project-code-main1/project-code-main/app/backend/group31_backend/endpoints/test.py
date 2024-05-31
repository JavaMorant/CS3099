from flask_app import app
from auth.auth import protected
from flask import Flask, jsonify
@protected

# @app.get('/get_wikidata_item/<string:q_id>')
# def get_wikidata_item(q_id):
#     try:
#         item = wdi_core.WDItemEngine(wd_item_id=q_id)
#         return jsonify(item.get_wd_json_representation())
#     except Exception as e:
#         return jsonify({"error": str(e)})

@app.get('/api/test')
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }


    return response_body, 200, {"Content-Type": "application/json"}

