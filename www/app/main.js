var timer;

window.onload = () => {
	if("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/chat/service-worker.js");
	}
	reloadform();
	timer = setInterval(fetchChat, 1000);
	log("started timer");
};

reloadform = () => {
	var username = localStorage.getItem("username");
	if(username)
		Get("username").value = username;
	log("reloaded form");
};

var currentbyte = 0;
var newcurrent = 0;

loadchat = (data) => {
	to = newcurrent;
	from = (currentbyte == 0 ? to-1024 : currentbyte); // to-prefetch value
	if(from < 0) from = 0;
	if(to <= 0) {
		log("no content");
		return;
	}
	if(to <= from) {
		return;
	}
	currentbyte = newcurrent;
	var headers;
	fetch("/chat.buf", {
		method: "GET",
		headers: {
			"Range": "bytes=" + from + "-" + to
		}
	})
	.then((resp) => {
		headers = resp.headers;
		return resp.text();
	})
	.then((data) => {
		Get("chatoutput").innerHTML += "\r\n" + data.trim();
		Get("chatoutput").scrollTop = Get("chatoutput").scrollHeight;
	})
	.catch((error) => {
		log("error: " + error);
	});
};

fetchChat = () => {
	fetch("/")
	.then((resp) => resp.text())
	.then((data) => {
		strings = data.split('\n');
		for(var i=0; i<strings.length; i++) {
			if(strings[i].includes("chat.buf")) {
				newcurrent = (strings[i].split(/\s+/))[5];
			}
		}
	})
	.then(loadchat)
	.catch((error) => {
		log("error: " + error);
		clearInterval(timer);
		Get("chatoutput").innerHTML = "server error!";
		Get("chatinput").disabled = true;
		Get("sendbutton").disabled = true;
	});
};

Get = (id) => { return document.getElementById(id); };

log = (data) => {
	console.log(data);
	Get("log").innerHTML += data + "<br>";
};

openConfig = () => {
	Get("config").style.display = "block";
};

send = () => {
	var data = Get("chatinput").value;
	if(data.trim().length == 0) {
		log("don't send: empty string");
		return;
	}
	log("send");
	var username = localStorage.getItem("username");
	if(!username) username = "webuser";
	var headers;
	fetch("/chat", {
		method: "PUT",
		body: (username + " → " + data)
	})
	.then((resp) => {
		Get("chatinput").value = "";
		log("PUT data");
	})
	.catch((error) => {
		log("PUT error: " + error);
	});
};

saveConfig = () => {
	log("saveConfig");
	localStorage.setItem("username", Get("username").value);
};

closeConfig = () => {
	Get("config").style.display = "none";
};
