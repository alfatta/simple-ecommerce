const { Router } = require('express')

const categoryController = require('../controller/category')
const productController = require('../controller/product')
const specificationController = require('../controller/specification')

const route = Router()

route.get('/product', productController.getAll)
route.get('/product/:id', productController.getById)
route.post('/product', productController.insert)
route.patch('/product/:id', productController.update)
route.delete('/product/:id', productController.delete)

route.get('/category', categoryController.getAll)
route.get('/category/:id/product', categoryController.getProduct)
route.post('/category', categoryController.insert)
route.patch('/category/:id', categoryController.update)
route.delete('/category/:id', categoryController.delete)

route.patch('/specification/:id', specificationController.update)
route.delete('/specification/:id', specificationController.delete)

module.exports = route