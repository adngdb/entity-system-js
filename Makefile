REPORTER = spec
TEST_FILES = `find test -name 'test_*.js'`

test:
	./node_modules/.bin/mocha $(TEST_FILES) --reporter $(REPORTER)

test-w:
	./node_modules/.bin/mocha $(TEST_FILES) --reporter $(REPORTER) --growl --watch

test-browser:
	xdg-open test/index.html

.PHONY: test test-w test-browser
