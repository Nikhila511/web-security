const fs = require('fs');
const htmlparser2 = require('htmlparser2');
// Read input html page as string	
var input_file_with_path = "Y40_80.html"
var html_str = fs.readFileSync(input_file_with_path, 'utf-8');

// Transform input html page to DOM tree, the DOM tree is stored in handler.dom
var handler = new htmlparser2.DomHandler();
var HTMLparser = new htmlparser2.Parser(handler);
HTMLparser.parseComplete(html_str);

var classesMap = new Map();
walkDOM(handler.dom);

function walkDOM(domTree){
	domTree.forEach(function(obj){
		if(obj.type == 'tag'){
			randomizeClasses(obj);
		}
	});
}

function randomizeClasses(treeNode){
	if(treeNode.attribs.class){
		var classNames = treeNode.attribs.class.split(" ");
		var randClassNames = "";

		classNames.forEach(function(name){
			if(classesMap.has(name)){
				randClassNames += " "+classesMap.get(name);
			}else{
				var x = randGenerate();
				var clsRan = "rand-class-"+x.toString();
				classesMap.set(name,clsRan);
				randClassNames += " "+clsRan;
			}
		});
		treeNode.attribs.class = randClassNames.trim();
	}
	if(treeNode.children){
		var nodeChildren = treeNode.children;
		nodeChildren.forEach(function(c){
			
			if(c.type == "tag"){
				randomizeClasses(c);
			}
		});
	}
}

function randGenerate() {
      return Math.floor(Math.random() * 9000) + 1000;
}

var html = require('htmlparser-to-html');

// Transform DOM tree back to HTML
var randomized = html(handler.dom);
try {
fs.writeFileSync("randomized_Y40-80.html", randomized);
}
catch (err) {;}

//console.log(classesMap);
// CSS files randomisation.
var css = require('css');
var files = fs.readdirSync('Y40_80_files');
files.forEach(function(fileName){
	if(fileName.split(".").pop() == "css"){
		var cssstr = fs.readFileSync("Y40_80_files/" +fileName, 'utf8');
		var astObj = css.parse(cssstr);
		if(astObj.type == "stylesheet"){
			var cls = astObj.stylesheet.rules;
			cls.forEach(function(clsObj){
				if(clsObj.type == 'rule'){
					cssRandomise(clsObj);
				}
				else if(clsObj.type == 'media'){
					clsObj.rules.forEach(function(ruleObj){
						if(ruleObj.type == 'rule'){
							cssRandomise(ruleObj);
						}
					});
				}
			});
		}
		//converting AST object back to css string
		var newcssStr = css.stringify(astObj);
		fs.writeFile("Y40_80_files/" +fileName, newcssStr, 'utf8', function (err) {
	     	if (err) 
	     		return console.log(err);
  		});
	}
});

function cssRandomise(clsObj){
	if(clsObj.selectors){
		// clsObj.selectors is an array of strings
		for(var i=0; i<clsObj.selectors.length; i++){
			var s = clsObj.selectors[i];
			var randomisedSelctorsStr = "";
			classes = s.split(" ");
			classes.forEach(function(c){
				// For strings that are like .classname or span.classname
				var classsplit = c.split(".");
				if(classsplit.length != 0){
					var j = 0;
					var first = "";
					if(classsplit[0] != ""){
						first = classsplit[0];
						j = 1;
					}
					for(var cn = j; cn<classsplit.length; cn++){
						var x = getRandomisedStr(classsplit[cn]);
						var finalstr = first+"."+x;
						if(randomisedSelctorsStr == ""){
							randomisedSelctorsStr += finalstr;
						}else{
							var str = " "+finalstr;
							randomisedSelctorsStr += str;
						}
					}
				}
			});
			clsObj.selectors[i] = randomisedSelctorsStr;
			//console.log(randomisedSelctorsStr);
		}
	}
}
function getRandomisedStr(c){
	if(classesMap.has(c)){
		return classesMap.get(c);
	}else{
		return c;
	}
}

