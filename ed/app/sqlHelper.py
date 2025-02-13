from sqlalchemy import create_engine, text

import pandas as pd

# Define the SQLHelper Class
# PURPOSE: Deal with all of the database logic

class SQLHelper():

    # Initialize PARAMETERS/VARIABLES

    #################################################
    # Database Setup
    #################################################
    def __init__(self):
        self.engine = create_engine("sqlite:///earthquakes.sqlite")

    #################################################################

    def queryBarData(self, min_year):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text(f"""SELECT
                    Year as year,
                    count(ID) as num_earthquakes
                FROM
                    earthquakes
                WHERE
                    Year >= {min_year}
                GROUP BY
                    Year
                ORDER BY
                    Year asc;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)

    def queryTableData(self, min_year):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text(f"""SELECT
                    Year as year,
                    Magnitude as magnitude,
                    Source as source,
                    Type as type,
                    Latitude as latitude,
                    Longitude as longitude
                FROM
                    earthquakes
                WHERE
                    Year >= {min_year}
                ORDER BY
                    Year asc;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)

    def queryMapData(self, min_year):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text(f"""SELECT
                    Year as year,
                    Magnitude as magnitude,
                    Source as source,
                    Type as type,
                    Latitude as latitude,
                    Longitude as longitude
                FROM
                    earthquakes
                WHERE
                    Year >= {min_year}
                ORDER BY
                    Year asc;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)
