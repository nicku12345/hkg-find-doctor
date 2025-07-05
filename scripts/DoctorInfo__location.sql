-- Create a dedicated separate schema
create schema if not exists "gis";

-- Example: enable the "postgis" extension
create extension postgis with schema "gis";

-- Step 1: Add the new column
ALTER TABLE "DoctorInfo"
ADD COLUMN location gis.GEOGRAPHY(Point, 4326);

-- Step 2: Populate the new column with points
UPDATE "DoctorInfo"
SET location = gis.ST_MakePoint(
    CAST("addressLongitude" AS float),
    CAST("addressLatitude" AS float)
);

-- Step 3: Create an index on location
CREATE INDEX idx_location ON "DoctorInfo" USING GIST (location);

-- step 4: SQL function to query doctors
create or replace function get_doctors_in_bbox (
  min_lat float,
  min_long float,
  max_lat float,
  max_long float
) returns setof public."DoctorInfo"
set
  search_path to '' language sql as $$
	select *
	from public."DoctorInfo"
	where location operator(gis.&&) gis.ST_SetSRID(gis.ST_MakeBox2D(gis.ST_Point(min_long, min_lat), gis.ST_Point(max_long, max_lat)), 4326)
$$;