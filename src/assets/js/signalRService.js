import * as signalR from "@microsoft/signalr";

export function initSignalR(context) {
  const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://213.238.181.142/notifiHub", {
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  hubConnection.on("ReceiveNotification", () => {
    context.fetchNotifications(context.selectedCity);
  });

  hubConnection
    .start()
    .then(() => console.log("SignalR bağlantısı başarılı"))
    .catch((err) => console.error("SignalR bağlantı hatası:", err));

  return hubConnection;
}