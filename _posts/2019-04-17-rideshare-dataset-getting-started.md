# Introduction
I was recently reading Steve Vance and John Greenfield's [article](https://chi.streetsblog.org/2019/04/18/the-most-common-chicago-ride-hailing-trip-is-a-1-mile-hop-from-river-north-to-loop/) summarizing data from the City of Chicago's recent opening of anonymized [ride hailing data](https://data.cityofchicago.org/Transportation/Transportation-Network-Providers-Trips/m6dm-c72p). I figured I would play around with the data, to at least learn something new myself, and at most find something interesting in the dataset. I also wanted to share with others how I went about the technical aspects of my analyses. So here we go...

# The plan
I did some research, and found that [PostGIS](https://postgis.net) is a very popular, open-source Postgres extension for dealing with GIS data. [Postgres](https://www.postgresql.org/) is a successful relational SQL database. Postgres could help us answer questions like "Which census tract paid the most in tips?". But with the PostGIS extension, we can answer more geographically-sophisticated questions like "Does the size of the tip depend on the distance traveled on the trip?". I also have heard of [Leaflet](https://leafletjs.com/), a JavaScript library that is used for map visualizations, that I might be able to use to visualize answers to some of these questions.

So, the plan looks something like this:

Ubuntu 16.0.4...

"deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main" in "/etc/apt/sources.list.d/pgdg.list"

sudo "wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -"

sudo apt-get install postgis 

sudo su -  postgres

/usr/lib/postgresql/11/bin/pg_ctl -D /etc/postgresql/11/main -l /var/log/postgresql/postgresql-11-main.log start

psql -p 5433

create database rideshare;

\c rideshare;

create user rideshare with password 'rideshare';

alter database rideshare owner to rideshare;

CREATE EXTENSION postgis;

CREATE EXTENSION postgis_topology;

create table trip (trip_id char(40) unique, trip_start_timestamp timestamp not null, trip_end_timestamp timestamp not null, trip_seconds int not null, trip_miles numeric(8, 1) not null, pickup_census_tract bigint null, dropoff_census_tract bigint null, fare numeric(8, 2) not null, tip smallint not null, additional_charges numeric(8, 2), shared_trip_authorized boolean not null, trips_pooled smallint not null, pickup_centroid_location geometry(POINT, 4326), dropoff_centroid_location geometry(POINT, 4326));

sudo apt-get install python-dev

sudo apt install virtualenv

virtualenv rideshare_env

source rideshare_env/bin/activate

pip install psycopg2

RUN THE PYTHON IMPORT SCRIPT

sudo apt install gdal-bin

wget -O censustracts.geojson "https://data.cityofchicago.org/api/geospatial/5jrd-6zik?method=export&format=GeoJSON"

ogr2ogr -f "PostgreSQL" PG:"dbname=rideshare user=rideshare password=rideshare host=localhost port=5433" censustracts.geojson


psql --dbname=rideshare --host=localhost --port=5433 --username=rideshare 

\d

\d ogrgeojson

select * from  ogrgeojson limit 1;

select geoid10 from ogrgeojson limit 1;
   geoid10   
-------------
 17031842400
 
 select * from trip where dropoff_census_tract = 17031842400;

lets make a new table....

select ST_geometrytype(wkb_geometry) from ogrgeojson;

create table census_tract (census_tract_id bigint unique, tract_name varchar(50), tract_geometry geometry(multipolygon, 4326));

insert into census_tract select cast(geoid10 as bigint), name10, wkb_geometry from ogrgeojson;

select count(\*) from census_tract;

select count(distinct dropoff_census_tract) from trip;

rideshare=> select distinct dropoff_census_tract, dropoff_centroid_location
rideshare-> from trip t
rideshare-> left join census_tract c
rideshare->  on c.census_tract_id = t.dropoff_census_tract
rideshare-> where c.census_tract_id is null;

select dropoff_census_tract, tract_geometry, avg(tip/t.fare) from trip t join census_tract c on c.census_tract_id=t.dropoff_census_tract where t.fare != 0 group by dropoff_census_tract, tract_geometry;

NOOO out of space. move the db

https://www.digitalocean.com/community/tutorials/how-to-move-a-postgresql-data-directory-to-a-new-location-on-ubuntu-16-04

sudo su postgres
/usr/lib/postgresql/11/bin/pg_ctl stop -D /etc/postgresql/11/main

exit (be root)
sudo rsync -av /var/lib/postgresql /mnt/volume-nyc1-01

sudo mv /var/lib/postgresql/11/main /var/lib/postgresql/11/main.bak

sudo vim /etc/postgresql/11/main/postgresql.conf
set:
data_directory = '/mnt/volume-nyc1-01/postgresql/11/main'

/usr/lib/postgresql/11/bin/pg_ctl start -D /etc/postgresql/11/main

SHOW data_directory;

woo we moved the db

select dropoff_census_tract, tract_geometry, avg(tip/t.fare) from trip t join census_tract c on c.census_tract_id=t.dropoff_census_tract where t.fare != 0 group by dropoff_census_tract, tract_geometry;
welp that is still taking forever


create table tip_by_tract as select dropoff_census_tract, avg(tip/t.fare) from trip t where t.fare != 0 group by dropoff_census_tract;

ogr2ogr -f "GeoJSON" tip_by_census_dropoff.geojson PG:"dbname=rideshare user=rideshare password=rideshare host=localhost port=5433" -sql "select * from tip_by_tract t join census_tract c on c.census_tract_id=t.dropoff_census_tract;"




