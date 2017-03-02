"use strict";

const LOG_ID = 'USERS - ';

var onRosterPresenceChanged;

class Contacts {

    constructor(_eventEmitter, _logger) {
        var that = this;

        this.contacts = [];
        this.xmpp = null;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

        onRosterPresenceChanged = (presence) => {
            var contact = that.contacts.find(function(contact) {
                return contact.jid_im == presence.jid;
            });

            if(contact) {
                //contact.show = presence.show;
                contact.priority = presence.priority;
                contact.showstamp = presence.delay;
                //contact.status = presence.status;

                // user device
                var isMobile = false;
                var isWeb = false;
                var isDesktop = false;
                var isNode = false;
                if(presence.resource.indexOf('mobile') === 0) {
                    isMobile = true;
                }
                else if(presence.resource.indexOf('desk') === 0) {
                    isDesktop = true;
                }
                else if(presence.resource.indexOf('web') === 0) {
                    isWeb = true;
                }
                else if(presence.resource.indexOf('node') === 0) {
                    isNode = true;
                }

                if((presence.show === "" || presence.show === "online") && (presence.status === "mode=auto" || presence.status === "" )) {
                    contact.presence = "online";
                    if(isMobile) {
                        contact.status = "mobile";
                    } else {
                        contact.status = "";
                    }
                }
                else if(presence.show === "online-mobile") {
                    contact.presence = "online";
                    contact.status = "mobile";
                }
                else if(presence.show === "unavailable") {
                    contact.presence = "offline";
                    contact.status = "";
                }
                else if((presence.show === "away" && presence.status === "") || (presence.show === "xa" && presence.status === "away")) {
                    contact.presence = "away";
                    contact.status = "";
                }
                else if(presence.show === "xa" && presence.status === "") {
                    contact.presence = "offline";
                    contact.status = "";
                }
                else if(presence.show === "dnd" && (presence.status === "" || presence.status === "audio" || presence.status === "video" || presence.status === "presentation")) {
                    contact.presence = "busy";
                    contact.status = presence.status;
                }
                else {
                    contact.presence = "";
                    contact.status = ""
                    that.logger.log("info", LOG_ID + "(onRosterPresenceChanged) presence not managed", presence.show, presence.status);    
                }

                var status = contact.status.length > 0 ? contact.status : "-";
                that.logger.log("info", LOG_ID + "(onRosterPresenceChanged) presence changed to " + contact.presence + "|" + status + " for " + contact.displayName);
                that.eventEmitter.emit('rainbow.onrosterpresencechanged', contact);
            }
            else {
                that.logger.log("warn", LOG_ID + "(onRosterPresenceChanged) no contact found for " + presence.jid);
            }
        }
    }

    start(_xmpp, _rest) {
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.xmpp = _xmpp;
        this.rest = _rest;
        this.eventEmitter.on('rainbow_onrosterpresence', onRosterPresenceChanged);
        this.logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    
    getRosters() {

        var that = this;
        this.logger.log("debug", LOG_ID + "(getRosters) _entering_");
        return new Promise(function(resolve, reject) {
            
            that.eventEmitter.once('rainbow_onrosters', function(jids) {
                that.rest.getContacts(jids).then(function(listOfContacts) {

                    that.contacts = listOfContacts.users;
                    that.logger.log("debug", LOG_ID + "(getRosters) successfully");
                    that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
                    resolve();
                }).catch(function(err) {
                    that.logger.log("warn", LOG_ID + "(getRosters) error", err);
                    that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
                    reject(err);
                });
            });
        
            that.xmpp.getRosters();
        });
    }

    /**
     * @public
     * @method getAll
     * @return {Object[]} the list of contacts
     * @description
     *  Return the list of contacts
     */
    getAll() {
        return this.contacts; 
    }

    stop() {

    }
}

module.exports = Contacts;