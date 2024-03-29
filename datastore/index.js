const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    var filePath = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(filePath, text, 'utf8', (err) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id, text});
      }
    });
  });
};

exports.readOne = (id, callback) => {
  var path = `${exports.dataDir}/${id}.txt`;
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { id: id, text: data});
    }
  });
};

var readOneAsync = Promise.promisify(exports.readOne);

exports.readAll = (callback) => {
  return new Promise((resolve, reject) => {
    fs.readdirAsync(exports.dataDir)
      .then (function (files) {
        if (files.length === 0) {
          resolve(callback(null, []));
        }
        var test = [];
        files.forEach(file => {
          var textNum = file.split('.');
          readOneAsync(textNum[0])
            .then(user => {
              test.push(user);
              if (test.length === files.length) {
                resolve(callback(null, test));
              }
            });
        });
      });
  });
};

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      if (!files.includes(id + '.txt')) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        var filePath = path.join(exports.dataDir, `${id}.txt`);
        fs.writeFile(filePath, text, 'utf8', (err) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, { id, text});
          }
        });
      }
    }
  });
};

exports.delete = (id, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      if (!files.includes(id + '.txt')) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        var filePath = path.join(exports.dataDir, `${id}.txt`);
        fs.unlink(filePath, (err) => {
          if (err) {
            callback(err, null);
          } else {
            callback();
          }
        });
      }
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
