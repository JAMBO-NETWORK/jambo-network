'use strict';

const express = require('express');
const router = express.Router();

const Config = require('../configs');

const Joi = require('joi');

const Web3 = require('web3');
const Web3js = new Web3(new Web3.providers.HttpProvider(Config.Eth.httpProvider));

const models = require('../models');
const Contact = models.ContactSchema;

const XLSX = require('xlsx');
const path = require('path');
const moment = require('moment');


/**
 * POST Register
 * @param req
 *  address(body): eth address
 *  repostUrl(body): twitter url
 *  twitter(body): twitter account
 *  telegram(body): telegram account
 * @param res
 *   {
 *      status : xxx,
 *      result: xxx,
 *      err_msg : xxx
 *   }
 */
router.post('/register', async (req, res) => {
  let etherentAddress = req.body.address;
  const twitterRepostUrl = req.body.repostUrl;
  const twitterAccount = req.body.twitter;
  const telegram = req.body.telegram;

  const schema = Joi.object({
    etherentAddress: Joi.string().required().custom((value, helper) => {
      if (Web3js.utils.isAddress(value)) {
        return true;
      }
      helper.error('invalid etherent address');
    })
      .error(new Error('invalid etherent address')),
    twitterRepostUrl: Joi.string().uri().required()
      .error(new Error('invalid repost url')),
    twitterAccount: Joi.string().required().error(new Error('invalid twitter')),
    telegram: Joi.string().required().error(new Error('invalid telegram')),
  });

  try {
    const { error } = schema.validate({ etherentAddress, twitterRepostUrl, twitterAccount, telegram });

    if (error) {
      throw error;
    }
  } catch (err) {
    return sendWrongParamResult(res, err.message);
  }

  etherentAddress = Web3.utils.toChecksumAddress(etherentAddress);

  const query = {
    $or: [
      { etherentAddress },
      { twitterRepostUrl },
      { twitterAccount },
      { telegram },
    ],
  };
  let contactItem = await Contact.findOne(query);

  if (contactItem) {
    if (contactItem.etherentAddress === etherentAddress) {
      return sendWrongParamResult(res, 'etherent address exists');
    } else if (contactItem.twitterAccount === twitterAccount) {
      return sendWrongParamResult(res, 'twitter address exists');
    } else if (contactItem.twitterRepostUrl === twitterRepostUrl) {
      return sendWrongParamResult(res, 'repost url exists');
    } else if (contactItem.telegram === telegram) {
      return sendWrongParamResult(res, 'telegram exists');
    }
  }

  contactItem = new Contact();
  contactItem.etherentAddress = etherentAddress;
  contactItem.twitterRepostUrl = twitterRepostUrl;
  contactItem.twitterAccount = twitterAccount;
  contactItem.telegram = telegram;
  contactItem.createdAt = new Date();
  await contactItem.save();

  return sendSuccessResult(res, '');
});

/**
 * POST Export Excel
 * @param req
 *  password(body): 密码
 * @param res
 *   {
 *      status : xxx,
 *      result: xxx,
 *      err_msg : xxx
 *   }
 */
router.post('/export', async (req, res) => {
  const password = req.body.password;

  if (password !== Config.Password.password) {
    return sendWrongParamResult(res, 'wrong password');
  }

  const workBook = {
    SheetNames: [],
    Sheets: {},
  };

  const date = moment().format('YYYYMMDDkkmmss');

  const sheetData = [
    [ 'Ethernet Address', 'Twitter', 'Twitter Announcement', 'Telegram', 'Date' ],
  ];

  const contacts = await Contact.find({})
    .select({ etherentAddress: 1, twitterAccount: 1, telegram: 1, twitterRepostUrl: 1, createdAt: 1 })
    .sort({ createdAt: 1 });

  contacts.forEach(item => {
    sheetData.push([
      item.etherentAddress,
      item.twitterAccount,
      item.telegram,
      item.twitterRepostUrl,
      moment(item.createdAt).format('YYYY-MM-DD, kk mm ss'),
    ]);
  });


  const workSheet = XLSX.utils.aoa_to_sheet(sheetData);
  workBook.SheetNames.push('contact');
  workBook.Sheets.contact = workSheet;

  XLSX.writeFile(workBook, path.join(`${__dirname}/../public/contact`, `contact${date}.xlsx`));

  return sendSuccessResult(res, `contact${date}.xlsx`);
});


const sendWrongParamResult = (res, msg) => {
  res.writeHeader(400, {
    'Content-Type': 'application/json;charset=utf-8',
  });
  res.write(JSON.stringify({ status: -1, err_msg: msg }));
  res.end();
};

const sendSuccessResult = (res, msg) => {
  res.writeHeader(200, {
    'Content-Type': 'application/json;charset=utf-8',
  });
  res.write(JSON.stringify({ status: 0, result: msg, err_msg: '' }));
  res.end();
};


module.exports = router;
