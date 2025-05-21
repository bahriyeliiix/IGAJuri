// src/services/surveyService.js
import axios from 'axios';

const API_URL = 'https://localhost:7263/api';

export default {
  async fetchSurveys(context) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/Survey/GetMy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      context.apiData = (response.data.data || []).map(item => ({
        id: item.id,
        surveyName: item.title,
        description: item.description || '',
        createdDate: item.createdDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        filePath: item.path || '',
        plannedEndDate: item.plannedEndDate || '',
        jurors: item.jurors || [],
        isDeleted: item.isDeleted || false,
        isActive: item.isActive ?? true,
      }));
      context.noDataMessage = context.apiData.length === 0 ? 'Veri yok' : '';
    } catch (error) {
      console.error('Anketleri çekerken hata:', error);
      context.noDataMessage = 'Ver Scotia çekilirken hata oluştu';
    }
  },
  async fetchJurors(context, surveyId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/User/GetAllJurry/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      context.jurors = response.data.data || [];
    } catch (error) {
      console.error('Jüri listesi çekerken hata:', error);
      context.jurors = [];
    }
  },
  async openFolderDialog(context) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/System/ListFolders`, {
        headers: { Authorization: `Bearer ${token}` },
    });
      if (response.data.success) {
        context.folderTree = response.data.data;
        context.showFolderModal = true;
      } else {
        alert('Klasörler yüklenemedi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Klasör listeleme hatası:', error);
      alert('Klasörler yüklenirken hata oluştu!');
    }
  },
  async passivateSurvey(context, id) {
    try {
      const token = localStorage.getItem('token');
      await axios.get(`${API_URL}/Survey/Passive/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const survey = context.apiData.find(item => item.id === id);
      if (survey) survey.isActive = false;
      alert('Anket başarıyla pasifleştirildi');
    } catch (error) {
      console.error('Pasifleştirme hatası:', error);
      alert('Anket pasifleştirilirken hata oluştu!');
    }
  },
  async activateSurvey(context, id) {
    try {
      const token = localStorage.getItem('token');
      await axios.get(`${API_URL}/Survey/Active/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const survey = context.apiData.find(item => item.id === id);
      if (survey) survey.isActive = true;
      alert('Anket başarıyla aktifleştirildi');
    } catch (error) {
      console.error('Aktifleştirme hatası:', error);
      alert('Anket aktifleştirilirken hata oluştu!');
    }
  },
  async saveNewSurvey(context, survey) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/Survey/CreateOrEditSurvey`, survey, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      context.apiData.push({
        id: response.data.data.id,
        surveyName: response.data.data.title,
        description: response.data.data.description || '',
        createdDate: response.data.data.createdDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        filePath: response.data.data.path || '',
        plannedEndDate: response.data.data.plannedEndDate || '',
        jurors: [],
        isDeleted: response.data.data.isDeleted || false,
        isActive: response.data.data.isActive ?? true,
      });
      context.closeAddModal();
    } catch (error) {
      console.error('Yeni anket ekleme hatası:', error);
      alert('Anket eklenirken hata oluştu!');
    }
  },
  async saveEditSurvey(context, survey) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/Survey/CreateOrEditSurvey`, survey, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const index = context.apiData.findIndex(item => item.id === survey.id);
      if (index !== -1) {
        context.apiData[index] = {
          ...context.apiData[index],
          surveyName: survey.title,
          description: survey.description,
          filePath: survey.path,
          plannedEndDate: survey.plannedEndDate || null,
        };
      }
      context.closeEditModal();
    } catch (error) {
      console.error('Anket güncelleme hatası:', error);
      alert('Anket güncellenirken hata oluştu!');
    }
  },
  async saveJury(context) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/JuryAssignment/update-jurors`, {
        surveyId: context.selectedSurvey.id,
        selectedJuryIds: context.selectedJurors,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      context.selectedSurvey.jurors = [...context.selectedJurors];
      context.closeJuryModal();
    } catch (error) {
      console.error('Jüri güncelleme hatası:', error);
      alert('Jüriler güncellenirken hata oluştu!');
    }
  },
  async confirmDelete(context) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/Survey/DeleteSurvey/${context.deleteSurveyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      context.apiData = context.apiData.filter(item => item.id !== context.deleteSurveyId);
      context.closeDeleteModal();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Anket silinirken hata oluştu!');
    }
  },
};