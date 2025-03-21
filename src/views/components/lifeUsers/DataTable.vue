<template>
    <div class="card mb-4">
      <div class="card-header pb-0">
        <div class="notification-header">
          <h6>
            <span class="emoji">👥</span>
            <span class="text">KULLANICI DETAY LİSTESİ</span>
            <span class="emoji">🕒</span>
          </h6>
        </div>
      </div>
      <div class="card-body px-0 pt-0 pb-2">
        <div class="table-responsive p-0">
          <table class="table align-items-center justify-content-center mb-0">
            <thead>
              <!-- Tablo başlıkları -->
              <tr>
                <th>Sıra No</th>
                <th>User Code</th>
                <th>Zaman</th>
                <th>Nabız</th>
                <th>Enlem</th>
                <th>Boylam</th>
                <th>Şehir</th>
                <th>İlçe</th>
                <th>Mahalle</th>
                <th>Haritada Gör</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="data.length === 0">
                <td colspan="10" class="text-center">{{ noDataMessage || "Veri yok" }}</td>
              </tr>
              <tr v-else v-for="(item, index) in data" :key="index">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>User-{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ item.notification.time }}</td>
                <td :class="getCellColor(item.notification.time)">{{ item.lastPurse }}</td>
                <td>{{ getLatitude(item.notification.location) }}</td>
                <td>{{ getLongitude(item.notification.location) }}</td>
                <td>{{ item.adressDetail.cityName }}</td>
                <td>{{ item.adressDetail.distirctName }}</td>
                <td>{{ item.adressDetail.neighbourhoodName }}</td>
                <td>
                  <button class="btn btn-sm btn-primary" @click="$emit('open-map', item.notification.location)">
                    Haritada Gör
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { getLatitude, getLongitude } from "@/assets/js/helpers";
  
  export default {
    props: {
      data: Array,
      noDataMessage: String,
      currentPage: Number,
      itemsPerPage: Number,
    },
    methods: {
      getCellColor(time) {
        const now = new Date();
        const notificationTime = new Date(time);
        const diffInMinutes = (now - notificationTime) / (1000 * 60);
        if (diffInMinutes <= 20) return "bg-blue";
        if (diffInMinutes <= 60) return "bg-orange";
        return "bg-red";
      },
      getLatitude,
      getLongitude,
    },
  };
  </script>