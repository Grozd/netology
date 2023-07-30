const fs = require('node:fs')
const multer = require('multer')

// реализация хранения и обработки файлов, потому что кириллица из формы Windows-1251
function getDestination (req, file, cb) {
    if(file.mimetype.startsWith('image/')) {
      cb(null, `./public/bookFiles/cover/${Date.now()}-${file.originalname}`)
    } else {
      cb(null, `./public/bookFiles/${Date.now()}-${file.originalname}`)
    }
}

function MyCustomStorage () {
  this.getDestination = getDestination
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {

  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err)

    const writeStream = fs.createWriteStream(path ,{flags: 'a+'})
    // проверка только на ошибку
    function cbWrite(err) {
      if(err) {
        cb(err)
        return
      }
    }
    // вспомогательная функция для обработки события drain
    // увеличить events.defaultMaxListeners более 10
    function write(data, cbWrite) {
      if (!writeStream.write(data, cbWrite)) {
        writeStream.once('drain', cbWrite);
      } else {
        process.nextTick(cbWrite);
      }
    }
 
    // события чтения
    file.stream.on('data', async chunk => {
      // если пришла только обложка, ограничиваемся только записью
      if(file.mimetype.startsWith('image/')) {
        write(chunk, cbWrite)
        return
      }
      // если книга сначало перекодируем
      let decoder = new TextDecoder('windows-1251')
      let str = decoder.decode(chunk)
      write(str, cbWrite)
    })
    file.stream.on('end', () => {
      writeStream.end('This is the end\n'); 
    });

    writeStream.on('finish', () => {
      writeStream.removeAllListeners('drain')
      // может и не обязательно считать size
      fs.stat(path, (err, stats) => {
        if(err) {
          cb(err)
          return
        }
        cb(null, {
          path: path,
          size: stats.size
        })
      })
    })
  })
}

// не трогал, как из документации
MyCustomStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
}

module.exports = multer({
  storage: new MyCustomStorage(),
  fileFilter: (req, file, cb) => {
      //postman сам перекодирует фаил и название. В случае загрузки из браузера без обработчика
      //вот временное решение перекодировки названия файла
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      cb(null, true)
  },
  limits: {
      fieldNameSize: 20,
      fields: 10,
      fileSize: 2000000,
      files: 10,
      parts: 20,
      headerPairs: 100
  }
})