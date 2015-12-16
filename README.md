# koop-shapezipurl provider

This provider downloads zipped shapefiles from a remote url, unzips it, converts it to geojson and makes the data available as geojson and Esri FeatureServices.
It is suitable for shapefiles up to 50MB, there should be one shapefile per zipfile, when more shapefiles are present, the first one is used.

