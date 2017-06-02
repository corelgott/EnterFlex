var config = require('./config/main.cfg');

var Datastore = require('nedb')
var CryptoJS  = require("crypto-js");
var Q         = require('q');
 
var db = new Datastore({ filename: config.dbPath, autoload: true });

var decrypt = function(encrypted, password, salt) {
    // Decrypt 
    var bytes  = CryptoJS.AES.decrypt(encrypted, password, { iv : salt });
    return bytes.toString(CryptoJS.enc.Utf8);
}

var storage = {};


storage.register = function(name, hash, token, salt) {
    var deferred = Q.defer();
    db.insert({
        name : name,
        hash : hash,
        token : token,
        salt : salt
    }, function(err, doc) {
        if (err) { deferred.reject(err); return; }
        deferred.resolve(doc);
    });
    return deferred.promise;
}

storage.delete = function(id) {
    var deferred = Q.defer();
    db.remove({ _id : id }, function(err, docs) {
        if (err) { deferred.reject(err); return; }
        deferred.resolve(docs);
    });
    return deferred.promise;
}

storage.getAll = function() {
    var deferred = Q.defer();
    db.find({}, { name : 1 }, function(err, docs) {
        if (err) { deferred.reject(err); return; }
        deferred.resolve(docs);
    });
    return deferred.promise;
}

storage.get = function(cardId) {
    var deferred = Q.defer();
    
    var hash = CryptoJS.SHA256(cardId).toString();
    
    db.find({ hash: hash }, { token : 1, salt : 1 }, (err, dataset) => {
        if (err) { deferred.reject(err); return; }

        if (dataset == undefined) {
            deferred.reject('no data found!');
            return;
        }

        console.log(hash);
        console.log(dataset.token);

        // decrypt the token
        var plaintoken = decrypt(dataset.token, cardId + hash, dataset.salt);
        // return it
        deferred.resolve(JSON.parse(plaintoken));
    });

    return deferred.promise;
};

module.exports = storage;


/*
// Encrypt 
var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123');
*/