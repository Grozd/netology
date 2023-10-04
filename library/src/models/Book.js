const { Schema, model, isValidObjectId } = require('mongoose')

const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    authors: {
        type: String,
        required: true
    },
    favorite: String,
    fileCover: {
        type: String,
        default: ''
    },
    fileName: {
        type: String,
        default: ''
    },
    fileBook: {
        type: String,
        default: ''
    }
})

bookSchema.static({
    getAllBooks: async function() {
        try {
            let arrFound = await this.find({}).select('-__v')
            return arrFound
        }
        catch (error) {
            throw error
        }
    },
    createBook: async function(obj) {
        try {
            let newBook = new this({ ...obj })
            if(newBook) {
                return await newBook.save()
            } else return false
        }
        catch (error) {
            throw error
        }
    },
    updateBook: async function(id, obj) {
        try {
            return await this.findByIdAndUpdate(id, obj, {new: true})
        } catch (error) {
            throw error
        }
    },
    removeById: async function(id) {
        try {
            await this.findByIdAndDelete(id)
        } catch (error) {
            throw error
        }
    },
    getById: async function(id) {
        try {
            if(isValidObjectId(id)) {
                let arrFound = await this.find({"_id":id})
                return arrFound
            }
            // если недопустимое id
            return []
        } catch (error) {
            throw error
        }
    },
    getIdBookByTitleAndAuthors: async function(title, authors) {
        try {
            let res = await this.findOne({title: title, authors: authors}).exec()
            if(res) {
                return res
            } else return false
        }
        catch (error) { 
            throw error
        }
    },
    setFileCover: async function(id, path) {
        try {
            await this.findByIdAndUpdate(id, {fileCover: path})
        } catch (error) {
            throw error
        }
    }
});


module.exports = model('Book', bookSchema)