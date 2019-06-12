"use strict";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";

export {};


import {ErrorManager} from "../common/ErrorManager";

const LOG_ID = "GROUPS/SVCE - ";

/**
 * @class
 * @name Groups
 * @description
 *		This service manages groups which allow to create his own lists of contacts.
 *		<br><br>
 *		The main methods proposed in that module allow to: <br>
 *		- Get all groups of the user
 *		- Create a new group
 *		- Delete an existing group
 *		- Add a contact in a group
 *		- Remove a contact from a group
 */

 class Groups {
	public _xmpp: XMPPService;
	public _rest: RESTService;
	public _groups: any;
	public _eventEmitter: any;
	public _logger: any;

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._groups = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        this._eventEmitter.on("evt_internal_groupcreated", this._onGroupCreated.bind(this));
        this._eventEmitter.on("evt_internal_groupdeleted", this._onGroupDeleted.bind(this));
        this._eventEmitter.on("evt_internal_groupupdated", this._onGroupUpdated.bind(this));
        this._eventEmitter.on("evt_internal_useraddedingroup", this._onUserAddedInGroup.bind(this));
        this._eventEmitter.on("evt_internal_userremovedfromgroup", this._onUserRemovedFromGroup.bind(this));
    }

     start(_xmpp : XMPPService, _rest : RESTService) {
         let that = this;

         this._logger.log("debug", LOG_ID + "(start) _entering_");

         return new Promise(function(resolve, reject) {
             try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._groups = [];
/*
                 that._eventEmitter.removeListener("evt_internal_groupcreated", that._onGroupCreated);
                 that._eventEmitter.removeListener("evt_internal_groupdeleted", that._onGroupDeleted);
                 that._eventEmitter.removeListener("evt_internal_groupupdated", that._onGroupUpdated);
                 that._eventEmitter.removeListener("evt_internal_useraddedingroup", that._onUserAddedInGroup);
                 that._eventEmitter.removeListener("evt_internal_userremovedfromgroup", that._onUserRemovedFromGroup);

                 that._eventEmitter.on("evt_internal_groupcreated", that._onGroupCreated.bind(that));
                that._eventEmitter.on("evt_internal_groupdeleted", that._onGroupDeleted.bind(that));
                that._eventEmitter.on("evt_internal_groupupdated", that._onGroupUpdated.bind(that));
                that._eventEmitter.on("evt_internal_useraddedingroup", that._onUserAddedInGroup.bind(that));
                that._eventEmitter.on("evt_internal_userremovedfromgroup", that._onUserRemovedFromGroup.bind(that));
*/
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
             } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
             }
         });
     }

     stop() {
         var that = this;

         this._logger.log("debug", LOG_ID + "(stop) _entering_");

         return new Promise(function(resolve, reject) {
             try {
                that._xmpp = null;
                that._rest = null;
                that._groups = null;
/*
                that._eventEmitter.removeListener("evt_internal_groupcreated", that._onGroupCreated);
                that._eventEmitter.removeListener("evt_internal_groupdeleted", that._onGroupDeleted);
                that._eventEmitter.removeListener("evt_internal_groupupdated", that._onGroupUpdated);
                that._eventEmitter.removeListener("evt_internal_useraddedingroup", that._onUserAddedInGroup);
                that._eventEmitter.removeListener("evt_internal_userremovedfromgroup", that._onUserRemovedFromGroup);
*/
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
             } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
             }
         });
     }

     /**
     * @public
     * @method createGroup
     * @instance
     * @param {string} name The name of the group to create
     * @param {string} comment The comment of the group to create
     * @param {boolean} isFavorite If true, the group is flagged as favorite
     * @memberof Groups
     * @description
     *      Create a new group
     * @async
     * @return {Promise<Group, ErrorManager>}
     * @fulfil {Group} - Created group object or an error object depending on the result
     * @category async
     */
     createGroup(name, comment, isFavorite) {
         var that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(createGroup) _entering_");

             if (typeof isFavorite === "undefined") {
                 isFavorite = false;
             }

             if (!name) {
                 that._logger.log("warn", LOG_ID + "(createGroup) bad or empty 'name' parameter", name);
                 that._logger.log("debug", LOG_ID + "(createGroup) _exiting_");
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
             } 

            that._rest.createGroup(name, comment, isFavorite).then(group => {
                that._logger.log("debug", LOG_ID + "(createGroup) creation successfull");

                that._groups.push(group);
                resolve(group);

            }, err => {
                that._logger.log("error", LOG_ID + "(createGroup) error");
                that._logger.log("debug", LOG_ID + "(createGroup) _exiting_");
                reject(err);
            });
         });
     }

     /**
     * @public
     * @method deleteGroup
     * @instance
     * @param {Group} group The group to delete
     * @memberof Groups
     * @description
     * 		Delete an owned group
     * @async
     * @return {Promise<Group, ErrorManager>}
     * @fulfil {Group} - Deleted group object or an error object depending on the result
     * @category async
     */
     deleteGroup(group) {
         var that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(deleteGroup) _entering_");

             if (!group) {
                 that._logger.log("warn", LOG_ID + "(deleteGroup) bad or empty 'group' parameter", group);
                 that._logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                 return;
             } 
            that._rest.deleteGroup(group.id).then(function() {
                var foundIndex = that._groups.findIndex(el => {
                    return el.id === group.id;
                });

                if (foundIndex > -1) {
                    let groupDeleted = that._groups.splice(foundIndex, 1);
                    that._logger.log("info", LOG_ID + "(deleteGroup) delete " + groupDeleted.length + " group successfully");
                    that._logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                    resolve(groupDeleted[0]);
                } else {
                    resolve(null);
                }
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(deleteGroup) error");
                that._logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                reject(err);
            });
         });
     }
	
	/**
     * @public
     * @method updateGroupName
     * @instance
     * @param {Group} group The group to update
     * @param {string} name The new name of the group
     * @memberof Groups
     * @description
     * 		Update the name of a group
     * @async
     * @return {Promise<Group, ErrorManager>}
     * @fulfil {Group} - Updated group object or an error object depending on the result
     * @category async
     */
     updateGroupName(group, name) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(updateGroupName) _entering_");

            if (!group || !name) {
                if (!group) {
                    that._logger.log("warn", LOG_ID + "(updateGroupName) bad or empty 'group' parameter", group);
                }
                if (!name) {
                    that._logger.log("warn", LOG_ID + "(updateGroupName) bad or empty 'name' parameter", group);
                }
                that._logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } else if (group.name === name) {
                that._logger.log("info", LOG_ID + "(updateGroupName) name of group is already defined to " + name + ", nothing is done");
                resolve(group);
            } else {
                that._rest.updateGroupName(group.id, name).then((group : any) => {
                    var foundIndex = that._groups.findIndex(el => {
                        return el.id === group.id;
                    });

                    if (foundIndex > -1) {
                        that._groups[foundIndex].name = group.name;
                        that._logger.log("info", LOG_ID + "(updateGroupName) update name to " + group.name + " of group with id " + group.id + " successfully");
                        that._logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                        resolve(that._groups[foundIndex]);
                    } else {
                        resolve(null);
                    }
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(updateGroupName) error");
                    that._logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                    reject(err);
                });
            }
        });
     }

    /**
     * @private
     * @description
     *      Internal method
     */
     getGroups() {
         let that = this;

         return new Promise(function(resolve, reject) {

            that._logger.log("debug", LOG_ID + "(getGroups) _entering_");
            that._rest.getGroups().then((listOfGroups : []) => {

                var promises = [];
                    
                listOfGroups.forEach((group : any) => {
                    promises.push(new Promise(function(res, rej) {
                        that._rest.getGroup(group.id).then(groupWithUsersInformation => {
                            res(groupWithUsersInformation);
                        }, err => {
                            rej(err);
                        });
                    }));
                });
    
                Promise.all(promises).then(groups => {
                    that._groups = groups;
                    that._logger.log("info", LOG_ID + "(getGroups) get successfully");
                    that._logger.log("debug", LOG_ID + "(getGroups) _exiting_");
                    resolve();
                }, err => {
                    reject(err);
                });
   
            }, err => {
                 that._logger.log("error", LOG_ID + "(getGroups) error", err);
                 that._logger.log("debug", LOG_ID + "(getGroups) _exiting_");
                 reject(err);
            });
         });
     }

     /**
     * @public
     * @method addUserInGroup
     * @instance
     * @param {Contact} contact The user to add in group
     * @param {Group} group The group
     * @memberof Groups
     * @description
     * 		Add a contact in a group
     * @async
     * @return {Promise<Group, ErrorManager>}
     * @fulfil {Group} - Updated group with the new contact added or an error object depending on the result
     * @category async
     */
     addUserInGroup(contact, group) {
         let that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(addUserInGroup) _entering_");

             if (!contact) {
                 that._logger.log("warn", LOG_ID + "(addUserInGroup) bad or empty 'contact' parameter", contact);
                 that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                 return;
             } else if (!group) {
                 that._logger.log("warn", LOG_ID + "(addUserInGroup) bad or empty 'group' parameter", group);
                 that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                 return;
             }
            var contactIndex = group.users.findIndex(user => user.id === contact.id);
            if (contactIndex === -1) {
                that._rest.addUserInGroup(contact.id, group.id).then((groupUpdated : any) => {
                
                that._rest.getGroup(groupUpdated.id).then((groupRetrieved : any) => {
                        var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupRetrieved.id);
                        that._groups[foundIndex] = groupRetrieved;
                        that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                        resolve(groupRetrieved);
                    }, err => {
                        reject(err);
                    });
                }, err => {
                    that._logger.log("error", LOG_ID + "(addUserInGroup) error");
                    that._logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                    reject(err);
                });
            } else {
                that._logger.log("warn", LOG_ID + "(addUserInGroup) User is already a member of the group");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
         });
     }

     /**
     * @public
     * @method removeUserFromGroup
     * @instance
     * @param {Contact} contact The user to remove from the group
     * @param {Group} group The destination group
     * @memberof Groups
     * @description
     *		Remove a contact from a group
     * @async
     * @return {Promise<Group, ErrorManager>}
     * @fulfil {Group} - Updated group without the removed contact or an error object depending on the result
     * @category async
     */
     removeUserFromGroup(contact, group) {
         let that = this;

         return new Promise(function(resolve, reject) {
             that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _entering_");

             if (!contact) {
                 that._logger.log("warn", LOG_ID + "(removeUserFromGroup) bad or empty 'contact' parameter", contact);
                 that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                 return;
             } else if (!group) {
                 that._logger.log("warn", LOG_ID + "(removeUserFromGroup) bad or empty 'group' parameter", group);
                 that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                 reject(ErrorManager.getErrorManager().BAD_REQUEST);
                 return;
             } 
             
            var contactIndex = group.users.findIndex(user => user.id == contact.id);
            if (contactIndex > -1) {
                that._rest.removeUserFromGroup(contact.id, group.id).then((group : any) => {
                    that._rest.getGroup(group.id).then((group :any) => {
                        var foundIndex = that._groups.findIndex(groupItem => groupItem.id === group.id);
                        that._groups[foundIndex] = group;
                        that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                        resolve(group);
                    }, err => {
                        reject(err);
                    });
                }, err => {
                    that._logger.log("error", LOG_ID + "(removeUserFromGroup) error");
                    that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                    reject(err);
                });
            } else {
                that._logger.log("warn", LOG_ID + "(removeUserFromGroup) contact not found in that group");
                that._logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                resolve(group);
            }
         });
     }

    /**
     * @public
     * @method getAll
     * @instance
     * @return {Array} The list of existing groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
     * @memberof Groups
     * @description
     *  Return the list of existing groups
     */
    getAll() {
        return this._groups;
    }

    /**
     * @public
     * @method getFavoriteGroups
     * @instance
     * @return {Array} The list of favorite groups with following fields: id, name, comment, isFavorite, owner, creationDate, array of users in the group
     * @memberof Groups
     * @description
     *  Return the list of favorite groups
     */
    getFavoriteGroups() {
        return this._groups.filter((group) => {
            return group.isFavorite;
        });
    }

    /**
     * @public
     * @method getGroupById
     * @instance
     * @param {String} group Id of the group to found
     * @return {Group} The group found if exist or undefined
     * @memberof Groups
     * @description
     *  Return a group by its id
     */
    getGroupById(id) {
        return this._groups.find((group) => {
            return group.id === id;
        });
    }

    /**
     * @public
     * @method getGroupByName
     * @instance
     * @param {String} name Name of the group to found
     * @return {Group} The group found if exist or undefined
     * @memberof Groups
     * @description
     *  Return a group by its id
     */
    getGroupByName(name) {
        return this._groups.find((group) => {
            return group.name === name;
        });
    }

    /**
     * @private
     * @method _onGroupCreated
     * @instance
     * @param {Object} data Contains the groupId of the created group
     * @memberof Groups
     * @description
     *		Method called when a group is created
     */
    _onGroupCreated(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then((groupCreated : any )=> {
            that._logger.log("debug", LOG_ID + "(_onGroupCreated) Group created", groupCreated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupCreated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupCreated;
            } else {
                that._groups.push(groupCreated);
            }

            that._eventEmitter.emit("evt_internal_groupcreated", groupCreated);
        });
    }

    /**
     * @private
     * @method _onGroupDeleted
     * @instance
     * @param {Object} data Contains the groupId of the deleted group
     * @memberof Groups
     * @description
     *		Method called when a group is deleted
     */
    _onGroupDeleted(data) {
        let that = this;

        var foundIndex = that._groups.findIndex(el => {
            return el.id === data.groupId;
        });

        if (foundIndex > -1) {
            let groupDeleted = that._groups.splice(foundIndex, 1);
            that._logger.log("debug", LOG_ID + "(_onGroupDeleted) Group deleted", groupDeleted[0].name);
            that._eventEmitter.emit("evt_internal_groupdeleted", groupDeleted[0]);
        } else {
            that._eventEmitter.emit("evt_internal_groupdeleted", null);
        }
    }

    /**
     * @private
     * @method _onGroupUpdated
     * @instance
     * @param {Object} data Contains the groupId of the updated group
     * @memberof Groups
     * @description
     *		Method called when a group is updated (name, comment, isFavorite)
     */
    _onGroupUpdated(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then((groupUpdated : any) => {
            that._logger.log("debug", LOG_ID + "(_onGroupUpdated) Group updated", groupUpdated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            that._eventEmitter.emit("evt_internal_groupupdated", groupUpdated);
        });
    }

    /**
     * @private
     * @method _onUserAddedInGroup
     * @instance
     * @param {Object} data Contains the groupId and the userId
     * @memberof Groups
     * @description
     *		Method called when a user is added to a group
     */
    _onUserAddedInGroup(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then((groupUpdated : any ) => {
            that._logger.log("debug", LOG_ID + "(_onUserAddedInGroup) User added in group", groupUpdated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);
            if (foundIndex > -1) {
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            var contactAddedIndex = groupUpdated.users.findIndex(userItem => userItem.id === data.userId);
            var contact = groupUpdated.users[contactAddedIndex];

            that._eventEmitter.emit("evt_internal_useraddedingroup", groupUpdated, contact);
        });
    }

    /**
     * @private
     * @method _onUserRemovedFromGroup
     * @instance
     * @param {Object} data Contains the groupId and the userId
     * @memberof Groups
     * @description
     *		Method called when a user is removed from a group
     */
    _onUserRemovedFromGroup(data) {
        let that = this;

        this._rest.getGroup(data.groupId).then((groupUpdated : any) => {
            that._logger.log("debug", LOG_ID + "(_onUserRemovedFromGroup) User removed from group", groupUpdated.name);

            var foundIndex = that._groups.findIndex(groupItem => groupItem.id === groupUpdated.id);

            var contact = null;

            if (foundIndex > -1) {
                var contactRemovedIndex = that._groups[foundIndex].users.findIndex(userItem => userItem.id === data.userId);
                contact = that._groups[foundIndex].users[contactRemovedIndex];
                that._groups[foundIndex] = groupUpdated;
            } else {
                that._groups.push(groupUpdated);
            }

            that._eventEmitter.emit("evt_internal_userremovedfromgroup", groupUpdated, contact);
        });
    }
 }

 module.exports = Groups;