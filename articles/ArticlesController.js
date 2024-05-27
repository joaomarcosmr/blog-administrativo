const express = require('express')
const slugify = require('slugify')
const router = express.Router()
const Category = require('../categories/Category')
const Article = require('./Article')
const adminAuth = require('../middlewares/adminAuth')

router.get('/admin/articles/', adminAuth, (req, res) => {
  Article.findAll({
    include: [{model: Category}] // inclui os artigos com model category por causa do relacionamento
  }).then((articles) => {
    res.render('admin/articles/index', {
      articles: articles
    })
  })
})

router.get('/admin/articles/new', adminAuth, (req, res) => {
  Category.findAll().then(categories => {
    res.render('admin/articles/new', {
      categories: categories
    })
  })
})

router.post('/articles/save', adminAuth, (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const category = req.body.category;

  console.log(category)

  Article.create({
    title: title,
    slug: slugify(title),
    body: body,
    categoryId: category
  }).then(() => [
    res.redirect('/admin/articles/')
  ])
})

router.get('/admin/articles/edit/:id', adminAuth, (req, res) => {
  const id = req.params.id

  if(isNaN(id)){
    redirect('admin/articles/')
  }
  Article.findByPk(id).then((article) => {
    if(article != undefined){
      Category.findAll().then((categories) => {
        res.render('admin/articles/edit', {
          article: article,
          categories: categories
        })
       })
    } else {
      res.redirect('admin/articles/')
    }
  }).catch(erro => {
    res.redirect('admin/articles/')
  })
})

router.post('/articles/update', adminAuth, (req, res) => {
  const id = req.body.id
  const title = req.body.title
  const body = req.body.body;
  const categoryId = req.body.categoryId;

  Article.update({title: title, body: body, slug: slugify(title), categoryId: categoryId},{
    where: {
      id: id
    }
  }).then(() => {
    res.redirect('/admin/articles')
  }).catch((err) => {
    res.redirect('/')
  })
})

router.post('/articles/delete', adminAuth, (req, res) => {
  const id = req.body.id

  if(id != undefined){
    if(!isNaN(id)){
      Article.destroy({
        where: {
          id: id
        }
      }).then(() => {
        res.redirect('/admin/articles')
      })
    } else {
      res.redirect('/admin/articles')
    }
  } else {
    res.redirect('/admin/articles')
  }
})

router.get('/articles/page/:num', (req, res) => {
  const page = req.params.num;
  let offset = 0;

  if(isNaN(page) || page == 1){
    offset = 0;
  } else {
    offset = (parseInt(page) - 1) * 2;
  }

  Article.findAndCountAll({
    limit: 2,
    offset: offset,
    order: [
      ['id', 'DESC']
    ],
  }).then(articles => {
    let next;
    if(offset + 4 >= articles.count){
      next = false;
    } else {
      next = true;
    }

    const results = {
      page: parseInt(page),
      next: next,
      articles: articles,
    }
    
    Category.findAll().then(categories => {
      res.render('admin/articles/page', {
        results: results, categories: categories
      })
    })
  })
})



module.exports = router;