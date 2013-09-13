
build: components index.js select.css template.js
	@component build --dev

template.js: template.html
	@component convert $<

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

test:
	@open test/index.html

.PHONY: clean test
