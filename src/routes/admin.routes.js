const { Router } = require('express');
const { adminAuth } = require('../middlewares/auth.middleware');
const admin = require('../controllers/adminController');

const router = Router();

router.post('/login', admin.login);

router.use(adminAuth);

router.get('/stats', admin.getStats);
router.get('/orders', admin.getOrders);
router.patch('/orders/:id/status', admin.updateOrderStatus);

router.get('/products', admin.getProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);

module.exports = router;
