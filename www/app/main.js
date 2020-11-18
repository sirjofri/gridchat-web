window.onload = () => {
	if("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/app/service-worker.js");
	}
	initialize();
	reloadform();
	if(localStorage.getItem("autosendjoin") == "true") {
		autosend("JOIN " + getUser() + " to chat (web client)");
	}
//	loadchat(true);
	window.addEventListener("resize", () => {
		Get("chatoutput").scrollTop = Get("chatoutput").scrollHeight;
	});
};

var ws;

canScroll = () => {
	var o = Get("chatoutput");
	return (o.scrollTop + o.offsetHeight == o.scrollHeight);
};

initialize = () => {
	Get("configbutton").addEventListener("click", openConfig);
	Get("sendbutton").addEventListener("click", send);
	Get("saveconfigbutton").addEventListener("click", saveConfig);
	Get("reloadconfigbutton").addEventListener("click", reloadform);
	Get("closeconfigbutton").addEventListener("click", closeConfig);
	Get("chatinput").addEventListener("keyup", (e) => {
		if(e.keyCode === 13){
			send();
			e.preventDefault();
		}
	});

	try{
		ws = new WebSocket("ws://"+location.host+"/magic/websocket");
		ws.onopen = function(ev){
			console.log(ev);
		};
		ws.onclose = function(ev){
			console.log(ev);
		};
		ws.onerror = function(ev){
			console.log(ev);
		};
		ws.onmessage = function(ev){
			console.log(ev);
		};
	}catch(e){
		console.error(e);
	}
};

reloadform = () => {
	var username = localStorage.getItem("username");
	if(username)
		Get("username").value = username;
	var autosendjoin = localStorage.getItem("autosendjoin") == "true";
	if(autosendjoin)
		Get("autosendjoin").checked = autosendjoin;
	log("reloaded form");
};

var currentbyte = 0;

async function loadchat(first) {
	let response = await fetch("/chat.buf", {
		method: "GET",
		headers: {
			"Range": "bytes=" + currentbyte + "-"
		}
	});
	if(response.status == 502){
		log("timeout. Retry");
		await loadchat(first);
	} else if(response.status != 200 && response.status != 206){
		log("error: "+response.statusText);
		await new Promise(resolve => setTimeout(resolve, 1000));
		await loadchat(first);
	} else {
		let message = (await response.text()).trim();
		var doscroll = first || canScroll();
		Get("chatoutput").innerHTML += "\r\n" + message;
		currentbyte += (new TextEncoder().encode(message)).length+1;
		if(doscroll)
			Get("chatoutput").scrollTop = Get("chatoutput").scrollHeight;
		loadchat(false);
	}
}

Get = (id) => { return document.getElementById(id); };

log = (data) => {
	console.log(data);
	Get("log").innerHTML += data + "<br>";
};

openConfig = () => {
	Get("config").style.display = "block";
};

getUser = () => {
	var username = localStorage.getItem("username");
	if(!username) username = "/usr/websh*t";
	return username;
};

send = () => {
	var data = Get("chatinput").value;
	if(data.trim().length == 0) {
		log("don't send: empty string");
		return;
	}
	Get("chatinput").value = "";
	log("send");
	var headers;
	fetch("/chat", {
		method: "PUT",
		body: (getUser() + " → " + data)
	})
	.then((resp) => {
		log("PUT data");
	})
	.catch((error) => {
		log("PUT error: " + error);
	});
};

autosend = (text) => {
	if(text.trim().length == 0) {
		log("don't send: empty string");
		return;
	}
	log("autosend");
	fetch("/chat", {
		method: "PUT",
		body: text
	})
	.then((resp) => {
		log("PUT data autosend");
	})
	.catch((error) => {
		log("PUT error autosend: " + error);
	});
}

saveConfig = () => {
	log("saveConfig");
	localStorage.setItem("username", Get("username").value);
	localStorage.setItem("autosendjoin", Get("autosendjoin").checked ? "true" : "false");
};

closeConfig = () => {
	Get("config").style.display = "none";
};
