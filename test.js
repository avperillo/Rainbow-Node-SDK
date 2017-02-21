var NodeSDK = require('./index');

var nodeSDK = new NodeSDK({
    http: {
        "host": "sandbox.openrainbow.com",
        "port": "443",
        "protocol": "https"
    },
    credentials: {
        "login": "rford@westworld.com",
        "password": "Password_123"
    },
    xmpp: {
		"host" : "sandbox.openrainbow.com",
        "port" : "443",
		"protocol" : "wss"
    }
});

nodeSDK.start();