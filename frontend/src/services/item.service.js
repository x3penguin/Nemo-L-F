import api from "./api";

class ItemService {
  getLostItems() {
    return api.get("?status=LOST");
  }

  getFoundItems() {
    return api.get("?status=FOUND");
  }

  getMatchedItems() {
    return api.get("?status=MATCHED");
  }

  getCollectingItems() {
    return api.get("?status=COLLECTING");
  }

  getRetrievedItems() {
    return api.get("?status=RETRIEVED");
  }

  reportLostItem(itemData) {
    return api.post("/lost", itemData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  reportFoundItem(itemData) {
    return api.post("/found", itemData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  updateItemStatus(id, status) {
    return api.put(`/${id}/status`, { status });
  }

  // uploadItemImage(file) {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   return api.post('/upload', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   });
  // }

  initiateCollection(itemId, collectionData) {
    return api.post(`/${itemId}/collection`, collectionData);
  }

  getCollectionDetails(itemId) {
    return api.get(`/${itemId}/collection`);
  }

  getPotentialMatches(itemId) {
    return api.get(`/${itemId}/potential-matches`);
  }

  getItemById(id) {
    return api.get(`/${id}`);
  }
  updateItem(id, updateData) {
    console.log("Calling updateItem with ID:", id);
    return api.put(`/${id}`, updateData);
  }

  deleteItem(id, options = {}) {
    // Include userId in the request for permission check
    return api.delete(`/${id}`, {
      data: { userId: options.userId },
    });
  }
}

export default new ItemService();
