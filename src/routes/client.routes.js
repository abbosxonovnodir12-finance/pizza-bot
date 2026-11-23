const { Router } = require('express');
const { telegramAuth } = require('../middlewares/auth.middleware');
const cart = require('../controllers/cartController');

const router = Router();

router.use(telegramAuth);

router.get('/me', cart.getProfile);
router.get('/products', cart.getProducts);
router.get('/orders', cart.getMyOrders);
router.get('/orders/:id', cart.getMyOrder);
router.post('/orders', cart.createOrder);

module.exports = router;
