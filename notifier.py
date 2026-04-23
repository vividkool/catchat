# -*- coding: utf-8 -*-
import os
import requests

class Notifier:
    @staticmethod
    def send(message):
        print(f"[Notification] {message}")
        
        # Slack
        slack_webhook = os.environ.get("SLACK_WEBHOOK_URL")
        if slack_webhook:
            try:
                requests.post(slack_webhook, json={"text": message})
            except Exception as e:
                print(f"Slack notification failed: {e}")
        
        # LINE
        line_token = os.environ.get("LINE_NOTIFY_TOKEN")
        if line_token:
            try:
                headers = {"Authorization": f"Bearer {line_token}"}
                data = {"message": message}
                requests.post("https://notify-api.line.me/api/notify", headers=headers, data=data)
            except Exception as e:
                print(f"LINE notification failed: {e}")
