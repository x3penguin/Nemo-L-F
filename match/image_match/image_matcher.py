# matching/src/image_matcher.py
import cv2
import numpy as np
import requests
from firebase_client import get_lost_items, get_item_by_id

def download_image(url):
    """Download image from URL to OpenCV format"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    return image

def compare_images(img1, img2):
    """Compare two images and return confidence score"""
    # Convert images to grayscale
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    
    # Resize images to same dimensions
    gray1 = cv2.resize(gray1, (300, 300))
    gray2 = cv2.resize(gray2, (300, 300))
    
    # Calculate histogram
    hist1 = cv2.calcHist([gray1], [0], None, [256], [0, 256])
    hist2 = cv2.calcHist([gray2], [0], None, [256], [0, 256])
    
    # Normalize histograms
    cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
    cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)
    
    # Compare histograms
    score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
    
    # Use SIFT for feature matching if available (not available in OpenCV 3.x+)
    try:
        sift = cv2.SIFT_create()
    except:
        try:
            sift = cv2.xfeatures2d.SIFT_create()
        except:
            return score * 100  # Return just histogram score if SIFT unavailable
    
    kp1, des1 = sift.detectAndCompute(gray1, None)
    kp2, des2 = sift.detectAndCompute(gray2, None)
    
    # Feature matching
    if des1 is not None and des2 is not None and len(des1) > 0 and len(des2) > 0:
        bf = cv2.BFMatcher()
        matches = bf.knnMatch(des1, des2, k=2)
        
        # Apply ratio test
        good_matches = []
        for m, n in matches:
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)
                
        feature_score = len(good_matches) / max(len(kp1), len(kp2), 1)
    else:
        feature_score = 0
    
    # Combine scores
    final_score = 0.5 * score + 0.5 * feature_score
    return final_score * 100  # Convert to percentage

def match_images(found_item_id, image_url):
    """Match found item against lost items"""
    try:
        # Get the found item details
        found_item = get_item_by_id(found_item_id)
        if not found_item or found_item.get('status') != 'FOUND':
            print(f"Item {found_item_id} not found or not in FOUND status")
            return None
        
        # Download the found item image
        found_img = download_image(image_url)
        
        # Get all lost items
        lost_items = get_lost_items()
        
        best_image_matches = []
        
        # Compare with each lost item
        for lost_item in lost_items:
            if 'imageUrl' not in lost_item or not lost_item['imageUrl']:
                continue
                
            try:
                # Download lost item image
                lost_img_url = lost_item['imageUrl']
                lost_img = download_image(lost_img_url)
                
                # Compare images
                confidence = compare_images(found_img, lost_img)
                print(f"Comparison with {lost_item['id']}: {confidence:.2f}%")
                
                if confidence > 85:  # 85% threshold
                    best_image_matches.append({'id':lost_item['id'],'image_confidence':confidence})
            except Exception as e:
                print(f"Error comparing with item {lost_item.get('id')}: {e}")
        
        if best_image_matches:
            return best_image_matches
        
        return None
        
    except Exception as e:
        print(f"Error in match_images: {e}")
        return None