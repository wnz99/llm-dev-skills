import unittest

from vouchers import Store, redeem


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.store = Store()
        self.addCleanup(self.store.close)

    def test_credit_is_persisted(self):
        redeem(self.store, "alpha", {"id": "v1", "tenant": "alpha", "cents": 500})
        self.assertEqual(self.store.total(), 500)

    def test_retry_does_not_double_credit(self):
        voucher = {"id": "v1", "tenant": "alpha", "cents": 500}
        redeem(self.store, "alpha", voucher)
        redeem(self.store, "alpha", voucher)
        self.assertEqual(self.store.total(), 500)
