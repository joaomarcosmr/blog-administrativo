const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const adminAuth = require('./middlewares/adminAuth')
const connection = require('./database/database')
const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const userController = require('./users/UserController')

const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require('./users/User')

// view engine definition
app.set('view engine', 'ejs')

//sessions
app.use(session({
  secret: "JDdanDOIW21@@ASKD22Mfgnannn..as.wqo2n11213121.,@odwpk*&((h",
  cookie: {
    maxAge: 30000
  }
}))

//body parser
app.use(bodyParser.urlencoded({ extended: true }))

//static
app.use(express.static('public'))

//database
connection.authenticate() // aqui é feita a autenticacao passando as informacoes escritas no connection la no database.js
  .then(() => {
    console.log('conexao feita com sucesso')
  })
  .catch((err) => {
    console.log(err)
  })

app.use('/', categoriesController) // aqui vai ser o prefixo dessas rotas +  as rotas passadas no arquivo
app.use('/', articlesController) // aqui vai ser o prefixo dessas rotas +  as rotas passadas no arquivo
app.use('/', userController) // aqui vai ser o prefixo dessas rotas +  as rotas passadas no arquivo


app.get('/', (req, res) => {
  Article.findAll({
    order: [
      ['id', 'DESC']
    ],
    limit: 2
  }).then(article => {
    Category.findAll().then(categories => {
      res.render('index', {articles: article, categories: categories})
    })
  })
})

app.get('/:slug', (req, res) => {
  const slug = req.params.slug;

  Article.findOne({
    where: {
      slug: slug
    }
  }).then(article => {
    if(article != undefined){
      Category.findAll().then(categories => {
        res.render('article', {article: article, categories: categories})
      })
    } else {
      res.redirect('/')
    }
  }).catch((err) => {
    console.log(err)
    res.redirect('/')
  })
})

app.get('/category/:slug', (req, res) => {
  const slug = req.params.slug;
  
  Category.findOne({
    where: {
      slug: slug
    },
    include: [{ model: Article }]
  }).then((category => {
    if(category != undefined){
      Category.findAll().then(categories => {
        res.render('index', {articles: category.articles, categories: categories})
      })
    } else {
      res.redirect('/')
    }
  })).catch(err => {
    console.log(err)
  })
})



app.listen(8000, () => {
  console.log('Servidor aberto no link: http://localhost:8000')
})