export const generateFakeForm = () => {
    return {
      title: "Örnek Anket Formu",
      description: "Bu örnek bir anket formudur. Tasarım amaçlıdır.",
      pages: [
        {
          questions: [
            {
              id: 'q1',
              title: 'Adınız nedir?',
              type: 'text',
              description: '',
              response: '',
              placeholder: 'Adınızı yazın...',
              required: true
            },
            {
              id: 'q2',
              title: 'Hangi programlama dillerini biliyorsunuz?',
              type: 'checkbox',
              description: 'Birden fazla seçenek işaretleyebilirsiniz',
              options: ['JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Ruby'],
              responses: [],
              required: false
            }
          ]
        },
        {
          questions: [
            {
              id: 'q3',
              title: 'Deneyim seviyeniz nedir?',
              type: 'multiple_choice',
              description: '',
              options: ['0-1 Yıl', '1-3 Yıl', '3-5 Yıl', '5+ Yıl'],
              response: '',
              required: true
            },
            {
              id: 'q4',
              title: 'Özgeçmişinizi yükleyin',
              type: 'file_upload',
              description: 'PDF veya DOCX formatında, maksimum 5MB',
              response: '',
              required: false
            }
          ]
        }
      ]
    }
  }
  
  export const questionTypes = [
    { value: 'text', label: 'Kısa Yanıt' },
    { value: 'multiple_choice', label: 'Çoktan Seçmeli' },
    { value: 'checkbox', label: 'Onay Kutusu' },
    { value: 'dropdown', label: 'Açılır Liste' },
    { value: 'file_upload', label: 'Dosya Yükleme' }
  ]