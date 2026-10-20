import sqlite3


class Store:
    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("CREATE TABLE credits (voucher TEXT PRIMARY KEY, cents INTEGER)")

    def credit_once(self, voucher, cents):
        with self.db:
            self.db.execute("INSERT OR IGNORE INTO credits VALUES (?, ?)", (voucher, cents))

    def total(self):
        return self.db.execute("SELECT COALESCE(SUM(cents), 0) FROM credits").fetchone()[0]

    def close(self):
        self.db.close()


def redeem(store, tenant, voucher):
    if tenant != voucher["tenant"]:
        raise PermissionError("foreign voucher")
    store.credit_once(voucher["id"], voucher["cents"])


def label(cents):
    return f"{cents} cents"
