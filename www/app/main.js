var timer;

window.onload = () => {
	if("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/app/service-worker.js");
	}
	initialize();
	reloadform();
	loadchat(null);
};

initialize = () => {
	// Get("prefetchbutton").addEventListener("click", loadEarlier);
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
};

reloadform = () => {
	var username = localStorage.getItem("username");
	if(username)
		Get("username").value = username;
	log("reloaded form");
};

var currentbyte = 1;

loadchat = (data) => {
	var headers;
	var response;
	fetch("/chat.buf", {
		method: "GET",
		headers: {
			"Range": "bytes=" + currentbyte + "-"
		}
	})
	.then((resp) => {
		response = resp;
		headers = resp.headers;
		if(resp.status == 502){ // Timeout
			return Promise.reject(resp);
		}
		return resp.text();
	}, (error) => {
		if(error.status == 502){ // Timeout
			log("timeout. Retry");
			loadchat(null);
		} else
			log("error: " + error);
	})
	.then((data) => {
		Get("chatoutput").innerHTML += "\r\n" + data.trim();
		currentbyte += (new TextEncoder().encode(data.trim())).length+1;
		Get("chatoutput").scrollTop = Get("chatoutput").scrollHeight;
		loadchat(null);
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
	Get("chatinput").value = "";
	log("send");
	var username = localStorage.getItem("username");
	if(!username) username = "/usr/websh*t";
	var headers;
	fetch("/chat", {
		method: "PUT",
		body: (username + " → " + data)
	})
	.then((resp) => {
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
