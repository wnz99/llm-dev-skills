# Voucher service fixture

This small application redeems a voucher once. Amounts are integer cents.
Each voucher belongs to one tenant; foreign tenants must never redeem it.
Repeated delivery must not add credit again. Lost or duplicate credit matters
more than the display label. The real store is SQLite, not a remote service.

CI runs `python3 -m unittest discover -s tests -v` from this directory.
The storage suite can be run with
`python3 -m unittest discover -s storage -p 'verify_*.py' -v`.
All databases are isolated in memory. No network or credentials are needed.

The fixture intentionally contains test-quality and discovery problems for
authoring evaluations. Do not clean it up in the skill package.
