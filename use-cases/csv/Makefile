all: csv-distinct-output.json csv-normalize-output.csv csv-stats-output.json csv-to-json-output.json

csv-distinct-output.json: ./csv-distinct.ini input.csv
	cat ./input.csv | ezs -v -p by=year $< > $@

csv-normalize-output.csv: ./csv-normalize.ini input.csv
	cat ./input.csv | ezs -v $< > $@

csv-stats-output.json: ./csv-stats.ini input.csv
	cat ./input.csv | ezs -v $< > $@

csv-to-json-output.json: ./csv-to-json.ini input.csv
	cat ./input.csv | ezs -v $< > $@
