const { Schema, model, isValidObjectId } = require('mongoose')

const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    }
})


commentSchema.static({
    createComment: async function(msg) {
        try {
            let newComment = new this(msg)
            if(newComment) {
                return await newComment.save()
            } else return false
        } catch (error) {
          throw error
        }
    },
    getAllByBook: async function(idBook) {
        try {
            if(isValidObjectId(idBook)) {
                let arrFound = await this.find({"book":idBook}).populate('author').select('-__v')
                return arrFound
            }
            // если недопустимое id
            return new Error('недопустимое id')
        } catch (error) {
          throw error
        }
    },
    deletingAllCommentsFromBook: async function(idBook) {
        try {
            if(isValidObjectId(idBook)) {
                return await this.deleteMany({ book: idBook })
            }
            // если недопустимое id
            return new Error('недопустимое id')
        } catch (error) {
            throw error
        }
    }
})

module.exports = model('Comment', commentSchema)