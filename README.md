db.books.insertMany([
    {
        title: "12 стульев",
        description: "Описание",
        authors: "Ильф и Петров"
    },
    {
        title: "Золотой Теленок",
        description: "Описание",
        authors: "Ильф и Петров"
    }
])

db.books.find({},{'title':1});

db.books.updateOne({_id:{$eq:2}},{$set: { authors:'Фет', description:'описание'}});