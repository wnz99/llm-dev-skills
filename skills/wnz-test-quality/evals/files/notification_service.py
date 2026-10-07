class NotificationService:
    def __init__(self, sender):
        self.sender = sender

    def notify(self, user, message):
        if not user["enabled"]:
            return False
        self.sender.send(user["email"], message)
        return True
