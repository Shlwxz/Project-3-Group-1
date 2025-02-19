import pandas as pd
import plotly.graph_objects as go
import sqlite3
from flask import Flask, jsonify, render_template, redirect, request
from sqlHelper import SQLHelper


#################################################
# Flask Setup
#################################################
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 # remove caching

# SQL Helper
sqlHelper = SQLHelper()


#################################################
# Flask STATIC Routes
#################################################

@app.route("/")
def welcome():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/map")
def map():
    return render_template("map.html")

@app.route("/about_us")
def about_us():
    return render_template("about_us.html")

@app.route("/works_cited")
def works_cited():
    return render_template("works_cited.html")

#################################################
# API Routes
#################################################

@app.route("/api/v1.0/bar_data/<min_year>")
def bar_data(min_year):
    # Execute queries
    df = sqlHelper.queryBarData(min_year)

    # Turn DataFrame into List of Dictionary
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/table_data/<min_year>")
def table_data(min_year):
    # Execute Query
    df = sqlHelper.queryTableData(min_year)

    # Turn DataFrame into List of Dictionary
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/map_data/<min_year>")
def map_data(min_year):
    # Execute Query
    df = sqlHelper.queryMapData(min_year)

    # Turn DataFrame into List of Dictionary
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/threat_factors")
def threat_factors():
    # Execute query
    df = sqlHelper.queryThreatFactors()

    # Convert DataFrame to JSON format
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/sunburst")
def sunburst_data():
    try:
        df, year_totals, quarter_totals = sqlHelper.querySunburstData()  # ✅ Correctly unpacks the tuple

        labels = [f"Year {y}" for y in year_totals.keys()]
        parents = [""] * len(year_totals)  # Year has no parent
        values = list(year_totals.values())

        if quarter_totals:
            labels += [f"Q{q} ({y})" for (y, q) in quarter_totals.keys()]
            parents += [f"Year {y}" for (y, q) in quarter_totals.keys()]
            values += list(quarter_totals.values())

        labels += df["state"].tolist()
        parents += [f"Q{q} ({y})" for (y, q) in zip(df["year"], df["quarter"])] if quarter_totals else [f"Year {y}" for y in df["year"]]
        values += df["lost_colonies"].tolist()

        return jsonify({"labels": labels, "parents": parents, "values": values})

    except Exception as e:
        print(f"🚨 Error in Sunburst API: {str(e)}")
        return jsonify({"error": str(e)}), 500
#############################################################

# ELIMINATE CACHING
@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r

#main
if __name__ == "__main__":
    app.run(debug=True)
