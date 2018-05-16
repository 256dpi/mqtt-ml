all:
	rm -rf ./dist
	./node_modules/.bin/parcel build -d discrete ./discrete.html
	./node_modules/.bin/parcel build -d sequence ./sequence.html
	mkdir -p ./dist
	cp -r discrete/. ./dist/
	cp -r sequence/. ./dist/
	rm -rf ./discrete
	rm -rf ./sequence
	cp index.html ./dist/
