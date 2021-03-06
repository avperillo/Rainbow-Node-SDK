let conf =  {
    sandbox: {
        http: {
            host: "sandbox.openrainbow.com",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "sandbox.openrainbow.com",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20"
        }
    },
    official: {
        http: {
            host: "openrainbow.com",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "openrainbow.com",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20"
        }
    },
    any: {
        http: {
            host: "",
            port: "443",
            protocol: "https"
        },
        xmpp: {
            host: "",
            port: "443",
            protocol: "wss",
            timeBetweenXmppRequests: "20"
        }
    },
    logs: {
        path: "/var/tmp/rainbowsdk/",
        level: "info",
        color: false,
        enableConsoleLog: true,
        "system-dev": {
            internals: false,
            http: false
        },
        zippedArchive: true,
        maxSize : "10m",
        maxFiles : null
    },
    im: {
        sendReadReceipt: true,
        messageMaxLength: 1024,
        sendMessageToConnectedUser: false,
        conversationsRetrievedFormat: "small",
        storeMessages: false, /* https://xmpp.org/extensions/xep-0334.html#hints :
         No store :
            A message containing a <no-store/> hint should not be stored by a server either permanently (as above) or temporarily,
            e.g. for later delivery to an offline client, or to users not currently present in a chatroom.
         // */
        /* copyMessage: true, /* https://xmpp.org/extensions/xep-0334.html#hints :
        No copies :
            Messages with the <no-copy/> hint should not be copied to addresses other than the one to which it is addressed, for example through Message Carbons (XEP-0280) [3].
            This hint MUST only be included on messages addressed to full JIDs and explicitly does not override the behaviour defined in XMPP IM [1] for handling messages to bare JIDs,
            which may involve copying to multiple resources, or multiple occupants in a Multi-User Chat (XEP-0045) [6] room.
        // */
        nbMaxConversations: 15,
        rateLimitPerHour: 100
    },
    mode:"xmpp",
    debug:true,
    permitSearchFromPhoneBook:true,
    displayOrder:"firstLast",
    servicesToStart : {
            presence: {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._settings);
            contacts:  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest);
            conversations :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._bubbles, that._fileStorage, that._fileServer);
            im :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._conversations, that._bubbles, that._fileStorage);
            profiles :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest);
            groups :  {
                start_up:true,
                optional:false
            }, //need services :  (that._xmpp, that._rest);

            bubbles:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            telephony:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._bubbles, that._profiles);
            channels:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            admin:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            fileServer:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._fileStorage);
            fileStorage:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._fileServer, that._conversations);
            calllog:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest, that._contacts, that._profiles, that._telephony);
            favorites:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            invitation:  {
                start_up:true,
                optional:true
            }, //need services :  (that._xmpp, that._rest);
            settings:  {
                start_up:true,
                optional:true
            } //need services : ( XMPPService, _rest : RESTService)
    }

};

module.exports = conf;
export {conf};
