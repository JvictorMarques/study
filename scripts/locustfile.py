from locust import HttpUser, task, between

class ReadyUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(10)
    def ready(self):
        self.client.get("/ready")

    @task(1)
    def root(self):
        self.client.get("/")
