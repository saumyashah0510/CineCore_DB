from locust import HttpUser, task, between

class CineCoreLoadTest(HttpUser):
    # Simulate a very short delay to generate higher load
    wait_time = between(0.1, 0.5)

    @task(4)
    def get_dashboard(self):
        self.client.get("/api/v1/analytics/dashboard")

    @task(2)
    def get_box_office(self):
        self.client.get("/api/v1/analytics/box-office")

    @task(2)
    def get_ott_deals(self):
        self.client.get("/api/v1/analytics/ott-deals")

    @task(2)
    def get_production_houses(self):
        self.client.get("/api/v1/analytics/production-houses")
