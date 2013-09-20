
build: components
	@component build

components: component.json
	@component install

clean:
	rm -rf components build

.PHONY: clean
