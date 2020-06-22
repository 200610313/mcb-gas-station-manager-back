const express = require('express')

const router = express.Router()

const employeeController = require('../controllers/employees-controller')

router.get('/', employeeController.getEmployees)
module.exports = router
