import unittest
from notification_service import NotificationService


class NotificationTests(unittest.TestCase):
    def test_delivers_welcome(self):
        class RecordingSender:
            def __init__(self):
                self.messages = []

            def send(self, recipient, body):
                self.messages.append((recipient, body))

        sender = RecordingSender()
        service = NotificationService(sender)
        result = service.notify({"enabled": True, "email": "alice@example.test"}, "Welcome")
        self.assertTrue(result)
        self.assertEqual(sender.messages, [("alice@example.test", "Welcome")])

    def test_opted_out_user_receives_nothing(self):
        class RecordingSender:
            def __init__(self):
                self.messages = []

            def send(self, recipient, body):
                self.messages.append((recipient, body))

        sender = RecordingSender()
        service = NotificationService(sender)
        result = service.notify({"enabled": False, "email": "bob@example.test"}, "Offer")
        self.assertFalse(result)
        self.assertEqual(sender.messages, [])

    def test_delivers_reset_message(self):
        class RecordingSender:
            def __init__(self):
                self.messages = []

            def send(self, recipient, body):
                self.messages.append((recipient, body))

        sender = RecordingSender()
        service = NotificationService(sender)
        result = service.notify({"enabled": True, "email": "carol@example.test"}, "Reset")
        self.assertTrue(result)
        self.assertEqual(sender.messages, [("carol@example.test", "Reset")])


if __name__ == "__main__":
    unittest.main()
