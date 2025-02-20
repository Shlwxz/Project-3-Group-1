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
        self.engine = create_engine("sqlite:///bees.sqlite")

    #################################################################

    def queryBarData(self, min_year):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text(f"""SELECT 
                state, 
                state_code,
                year,
                SUM(num_colonies) AS total_colonies,
                SUM(lost_colonies) AS total_lost_colonies,
                AVG(percent_lost) AS avg_percent_lost,
                SUM(renovated_colonies) AS total_renovated_colonies,
                AVG(percent_renovated) AS avg_percent_renovated,
                AVG(varroa_mites) AS avg_varroa_mites,
                AVG(pesticides) AS avg_pesticide_use,
                AVG(diseases) AS avg_diseases,
                AVG(other_pests_and_parasites) AS avg_other_pests,
                AVG(unknown) AS avg_unknown_causes
            FROM 
                bees
            WHERE
                state NOT IN ('United States', 'Other') AND
                year >= {min_year}
            GROUP BY 
                state, state_code, year
            ORDER BY 
                year, total_lost_colonies DESC;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)

    def queryTableData(self, min_year):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text(f"""SELECT 
                state, 
                state_code,
                year,
                SUM(num_colonies) AS total_colonies,
                SUM(lost_colonies) AS total_lost_colonies,
                AVG(percent_lost) AS avg_percent_lost,
                SUM(renovated_colonies) AS total_renovated_colonies,
                AVG(percent_renovated) AS avg_percent_renovated,
                AVG(varroa_mites) AS avg_varroa_mites,
                AVG(pesticides) AS avg_pesticide_use,
                AVG(diseases) AS avg_diseases,
                AVG(other_pests_and_parasites) AS avg_other_pests,
                AVG(unknown) AS avg_unknown_causes
            FROM 
                bees
            WHERE
                state NOT IN ('United States', 'Other') AND
                year >= {min_year}
            GROUP BY 
                state, state_code, year
            ORDER BY 
                year, total_lost_colonies DESC;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)

    def queryMapData(self, min_year):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text(f"""SELECT 
                state, 
                state_code,
                year,
                SUM(num_colonies) AS total_colonies,
                SUM(lost_colonies) AS total_lost_colonies,
                AVG(percent_lost) AS avg_percent_lost,
                SUM(renovated_colonies) AS total_renovated_colonies,
                AVG(percent_renovated) AS avg_percent_renovated,
                AVG(varroa_mites) AS avg_varroa_mites,
                AVG(pesticides) AS avg_pesticide_use,
                AVG(diseases) AS avg_diseases,
                AVG(other_pests_and_parasites) AS avg_other_pests,
                AVG(unknown) AS avg_unknown_causes,
                latitude AS latitude,
                longitude AS longitude
            FROM 
                bees
            WHERE
                state NOT IN ('United States', 'Other') AND
                year >= {min_year}
            GROUP BY 
                state, state_code, year
            ORDER BY 
                year, total_lost_colonies DESC;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)

    def queryThreatFactors(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect()

        # Define Query to get the average of each threat factor per year
        query = text("""
            SELECT year,
                AVG(varroa_mites) AS avg_varroa_mites,
                AVG(pesticides) AS avg_pesticides,
                AVG(diseases) AS avg_diseases,
                AVG(other_pests_and_parasites) AS avg_other_pests
            FROM bees
            GROUP BY year
            ORDER BY year ASC;
        """)
        
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)
    
    def querySunburstData(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect()

        # Define Query to get the average of each threat factor per year
        query = text("""
            SELECT year, quarter, state, SUM(lost_colonies) AS lost_colonies
            FROM bees
            WHERE quarter IS NOT NULL
            GROUP BY year, quarter, state
        """)
        
        df = pd.read_sql(query, con=conn)

        # Compute total colony loss at the YEAR level
        year_totals = df.groupby("year")["lost_colonies"].sum().to_dict()

        # Compute total colony loss at the QUARTER level
        quarter_totals = df.groupby(["year", "quarter"])["lost_colonies"].sum().to_dict()

        # Close the connection
        conn.close()
        return df, year_totals, quarter_totals
