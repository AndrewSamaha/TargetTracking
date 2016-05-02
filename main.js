
var links = [];
var root = null;

var Link = function(v) {
    this.parents = [];
    this.children = []; // {child: child, probability: ?}
    this.value = v;
    //console.log("\tcreating link: " + v);
    this.id = Math.floor(Math.random()*99999);
    
    
    this.hasChild = function(newchild) {
        //console.log(this.value + ".hasChild."+newchild.value + " children.length=" + this.children.length);
        for (var i = 0; i < this.children.length; i++) {
            if (newchild != null) {
                var child = this.children[i].child;
                if (newchild.value.toLowerCase() == child.value.toLowerCase()) {
                    //console.log("\t = " + child.value + " found!");
                    return true;
                } else {
                    //console.log("\t!= " + child.value + "," + child.id + " not found!");
                }
            } else {
                if (newchild == this.children[i]) {
                    //console.log("\t = " + child.value + " found! (both null)");
                    return true;
                }
            }
        }
        //console.log("\t != " + newchild.value + " not found!");
        return false;
    }
    this.addChild = function(newchild, probability) {
        if (newchild == null) {
            //console.log("\taddChild: trying to add null child to parent.value=" + this.value);
            return;
        }
        if (!this.hasChild(newchild)) {
            this.children.push({child: newchild, probability: probability});
            if (newchild != null) newchild.parents.push(this);
            //console.log("\taddChild: ["+this.value+"]->["+newchild.value+"] - added, numchildren: " + this.children.length);
        } else {
            //console.log("\taddChild(" + (newchild ? newchild.value : null) + ") - already exists");
        }
    }
    
    this.addParent = function(parent) {
        //make sure the child isn't in the link already
        for (var i = 0; i < this.parents.length; i++) {
            if (parent == null && this.parents[i] == null) return;
            if (this.parents[i] != null && parent != null) {
                if (this.parents[i].id == parent.id) return;
            }
        }
        this.parents.push(parent);
        if (parent != null) parent.children.addChild(this);
    }
    
    this.pickChild = function() {
        if (this.children.length <= 0) return null;
        if (this.children.length == 1) return this.children[0];
        return this.children[Math.floor(Math.random()*this.children.length)];
        /*
        var p = Math.random();
        var cumulativep = 0;
        for (var i = 0; i < this.children.length; i++) {
            cumulativep += this.children[i].probability;
            if (p <= cumulativep) return this.children[i];
        }
        return this.children[this.children.length-1];*/
    }
    
    this.getHTML = function(level) {
        if (level > 5) return "";
        
        var str = "";
        var space = Array(level*4).join("-");
        if (level == null) level = 0;
        str += space + this.value + " (" + this.children.length + ")<br>";
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i].child;
            if (child != null) {
                //try {
                str += child.getHTML(level + 1);
                /*} catch(e) {
                    str += Array(level*4).join("&nbsp;") + "json: [" + child.value + "] e="+e.toString()+"<br>";
                }*/
            }
        }
        return str;
    }
    
    this.getRandomChild = function() {
        if (this.children.length <= 0) return null;
        return this.children[Math.floor(Math.random()*this.children.length)].child;
    }
    
    this.generate = function(remaining) {
        var str = this.value.toLowerCase();
        if (remaining <= 1) return str;
        if (this.value == ".") return str;
        
        var child = this.getRandomChild();
        if (child == null) return str;
        else return str += " " + child.generate(remaining - 1);
    }
    
    
    links.push(this);
    //console.log("\tcreated link: " + links[links.length-1].value);
}

var Markov = function() {
    this.reset();
    
    this.reset = function() {
        this.links = [];
        this.originalSample = "";
        this.editedSample = "";
        this.words = [];
        this.root = null;
    }
    this.getLink = function(v) {
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i] == null) continue;
            if (this.links[i].value.toLowerCase() == v.toLowerCase()) {
                return this.links[i];
            }
        }
        return new Link(v);
    }
    this.setSample = function(sample) {
        this.originalSample = sample;
        this.editedSample = this.originalSample.replace(/(\r\n|\n|\r|\")/gm,"");                            //remove newlines
        this.editedSample = this.editedSample.replace(/(\S)([\.\,\:\;\?\!])+\s*(\S)/g,"$1 $2 $3");        //make sure all periods are followed by a space
        
    }
}

var getLink = function(v) {
    for (var i = 0; i < links.length; i++) {
        if (links[i] == null) continue;
        if (links[i].value.toLowerCase() == v.toLowerCase()) {
            //console.log("getLink, found: [" + links[i].value + "] + ["+v+"]");
            return links[i];
        }
    }
    //console.log("getLink, need a new link: " + v);
    return new Link(v);
}
var notRoot = function(v) {
    for (var i = 0; i < root.length; i++) {
        if (root[i].value.toLowerCase() == v.toLowerCase()) return false;
    }
    return true;
}

function init() {
    root = new Link("");
    
    $('input#analyze').click(function() {
        var text = $('textarea#inputsample').val();
        
        //The following is just regex testing
        //var test1 = "one.two three.four. five.six";
        //var test2 = test1.replace(/(\S)\.(\S)/g,"$1. $2");
        //alert(test1 + " - " + test2);
        

        text = text.replace(/(\r\n|\n|\r|\")/gm,"");                            //remove newlines
        text = text.replace(/(\S)([\.\,\:\;\?\!])+\s*(\S)/g,"$1 $2 $3");        //make sure all periods are followed by a space
        
        //console.log(text);
        //return;
        var words = text.split(" ");
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            if (word == ".") continue;
            if (word[word.length-1]==".") {
                words.splice(i,1,word.substring(0,word.length-1),".");
                continue;
            }
            if (word[word.length-1]==",") {
                words.splice(i,1,word.substring(0,word.length-1));
                continue;
            }
            if (word.length == 0) { words.splice(i,1); i--; }
        }
        console.log(words);
        
        var lastlink = root;
        for (var i = 0; i < words.length; i++) {
            var link = null;
            
            //first run
            if (lastlink == null) {
                lastlink = getLink(words[i]);
                if (notRoot(lastlink.value)) root.push(lastlink);
                continue;
            }
            
            //end of sentence
            if (words[i] == "." || words[i] == "!" || words[i] == "?") {
                //lastlink.addChild(null);
                lastlink = root;
                continue;
            }
            
            link = getLink(words[i]);
            lastlink.addChild(link,1);
            lastlink = link;
        }
        var str = "Ready<br>";//root.getHTML(0);
        str += "Unique words / total words: " + Math.floor(links.length*100/words.length)/100 + " (" + links.length + "/" + words.length + ")<br>";
        $('#output').html(str);//JSON.stringify(words);

        //send to server and process response
    });
    $('input#generate').click(function() {
        var str = "";
        for (var i = 0; i < 100; i++)
            str += i+": " + root.generate(100) + "<P>";
        $('#output').html(str);
    });

    tic();
}

function tic() {
    requestAnimationFrame(tic);
}

window.onload=init;