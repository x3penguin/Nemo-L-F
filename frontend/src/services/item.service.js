import api from './api';

class ItemService {
  getLostItems() {
    return api.get('/items?status=LOST');
  }
  
  getFoundItems() {
    return api.get('/items?status=FOUND');
  }
  
  getMatchedItems() {
    return api.get('/items?status=MATCHED');
  }
  
  getItemById(id) {
    return api.get(`/items/${id}`);
  }
  
  reportLostItem(itemData) {
    return api.post('/items/lost', itemData);
  }
  
  reportFoundItem(itemData) {
    return api.post('/items/found', itemData);
  }
  
  updateItemStatus(id, status) {
    return api.put(`/items/${id}/status`, { status });
  }
  
  uploadItemImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/items/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  initiateCollection(itemId, collectionData) {
    return api.post(`/items/${itemId}/collection`, collectionData);
  }
  
  getCollectionDetails(itemId) {
    return api.get(`/items/${itemId}/collection`);
  }
}

export default new ItemService();