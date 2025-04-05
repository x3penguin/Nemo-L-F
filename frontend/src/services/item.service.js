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
    if (!id) {
      console.error("Error in updateItem: No item ID provided");
      return Promise.reject(new Error("No item ID provided"));
    }

    // No manipulation of the ID - use it directly
    return api.put(`/${id}`, updateData);
  }

  deleteItem(id, options = {}) {
    if (!id) {
      console.error("Error in deleteItem: No item ID provided");
      return Promise.reject(new Error("No item ID provided"));
    }

    // Include userId in the request for permission check
    return api.delete(`/${id}`, {
      data: { userId: options.userId },
    });
  }
}

export default new ItemService();
