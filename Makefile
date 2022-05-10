w: clean
	-rm -fr python/{bin,include,lib,share}
	cp -prv python_env/win/* ./python/
	node_modules/.bin/electron-builder.cmd --win --x64
	(cd dist/win-unpacked; zip -r ../GUI-RECODE.w64.zip ./*)

m: clean
	-rm -fr python/{bin,include,lib,share}
	cp -prv python_env/mac/* ./python/
	electron-builder --mac --x64

clean:
	-rm -fr python/{bin,include,lib,share}
