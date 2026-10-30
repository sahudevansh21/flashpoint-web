// Web push: lock-screen alerts without an app store.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "Flashpoint", {
    body: data.body || "",
    icon: "/icon.svg",
    data: { url: data.url || "/feed" },
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
