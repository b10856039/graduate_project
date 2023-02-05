
from keras.preprocessing import image
from keras.models import Sequential,load_model
import numpy as np
import cv2
import os
import json
import sys

folderPath=os.path.abspath('.')

#import picture
img = cv2.imread(folderPath+'/public/img/save_disease_Image/'+sys.argv[1]) #改輸入方法
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
img = cv2.resize(img, (64,64))
img = np.reshape(img,(1,64,64,3))


#load model
model = Sequential()
model = load_model(folderPath+'/py_folder/model/banana_tree_model.h5') 
pred = model.predict(img)

#Predict
if pred[0][0]<pred[0][1]:
    print('生病')
elif pred[0][0]>pred[0][1]:
    print('健康')
else:
    print('error')