# simple-js-module-loader
a simple js module loader.


## usage

```html
<!DOCTYPE html>
<html>
<head lang="zh-cn">
	<meta charset="UTF-8">
	<title>a simple js loader</title>
	<script src="../loader.js"></script>
</head>

<body>

<p>a simple js loader.</p>

<script>
	myloader.register([{
		name: "a",
		url: "./ma.js"
	}, {
		name: "b",
		url: "./mb.js"
	}, {
		name: "c",
		url: "./mc.js"
	}, {
		name: "d",
		url: "./md.js"
	}]);

	myloader.use("a", function (a) {
		a.hello();
	});
</script>
</body>
</html>
```
