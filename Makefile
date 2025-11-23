# SPDX-FileCopyrightText: 2025 Paul Debus
#
# SPDX-License-Identifier: GPL-3.0-only

minify:
	@echo "Minifying manager.js..."
	@# Create a temporary file without the javascript: prefix
	@sed 's/^javascript://' manager.js > manager.tmp.js
	@# Minify the temporary file
	@./node_modules/.bin/uglifyjs manager.tmp.js -c -m -o manager.min.tmp.js
	@# Add the javascript: prefix back
	@echo -n "javascript:" > manager.minified.js
	@cat manager.min.tmp.js >> manager.minified.js
	@# Clean up temporary files
	@rm manager.tmp.js manager.min.tmp.js
	@echo "Done! Created manager.minified.js"
