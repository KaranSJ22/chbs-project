const express=require('express');

const router=express.Router();

const holidayController=require('../controllers/holidayController');

router.get('/holidays',holidayController.getAllHolidays);

module.exports=router;