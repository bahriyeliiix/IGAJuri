import axios from "axios";
import store from "@/store";

const apiBaseUrl = "http://213.238.181.142";

export async function fetchCities() {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No token found");

  store.dispatch("saveToken", token);
  const response = await axios.get(`${apiBaseUrl}/api/Adress/get-cities/2`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function fetchNotifications(cityId, context) {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No token found");

  store.dispatch("saveToken", token);
  const url = cityId
    ? `${apiBaseUrl}/api/Notification/last-list/${cityId}`
    : "http://213.238.181.142/api/Notification/last-list-all";

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.data.statusCode === 200) {
    context.apiData = response.data.data;
    context.noDataMessage = response.data.data.length === 0 ? "Veri yok" : "";
  } else {
    context.noDataMessage = "Veri çekilirken hata oluştu";
    context.apiData = [];
  }
}