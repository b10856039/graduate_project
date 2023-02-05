import pandas as pd
import numpy as np
import os
import sys


from keras.utils import load_img,img_to_array
from keras.applications.resnet import preprocess_input
from keras.models import Sequential



#載入資料
def load_Data(path, height, width):
    # print('Load', path)
    X=np.empty((1, height, width, 3))
    img=load_img(r"{}".format(path), target_size=(height, width))
    X[0]=img_to_array(img)
    X=preprocess_input(X)
    return X

#定義模型
def loadModel(path):
    from keras.models import load_model
    model = Sequential()
    model = load_model(path)
    return model

def main(path, modelPath):    
    height, width=256, 256
    #載入資料
    X_pred = load_Data(path, height, width)
    model = loadModel(modelPath)
    #編譯模型
    model.compile(loss='sparse_categorical_crossentropy', optimizer="adam", metrics=['accuracy'])
    
    #預測結果

    y_pred=model.predict(X_pred) 
    y_pred=np.argmax(y_pred, axis=1)
    if(y_pred==0):
        print('健康')
    elif(y_pred==1):
        print('炭疽病')
    else:
        print('黑斑病')
    return y_pred

if __name__ == '__main__':
    folderPath=os.path.abspath('.')
    pred = main(folderPath+'/public/img/save_disease_Image/'+sys.argv[1],folderPath+'/py_folder/model/test_model.h5')#main('D:\\mongoData\\C2-Dev\\00002.jpg', 'D:\\mongoData\\C1vsC2.h5')