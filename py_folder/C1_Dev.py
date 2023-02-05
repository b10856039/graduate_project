'''
這個模型能準確預測 A、C 品質, 但無法準確預測 B 品質
'''

import tensorflow
import os
import sys
import numpy as np
from keras.utils import load_img,img_to_array
from keras.models import Sequential



#載入資料
def load_Data(path, height, width):
    print('Load')
    X=np.empty((1, height, width, 3))
    img=load_img(r"{}".format(path), target_size=(height, width))
    X[0]=img_to_array(img)
    return X

#定義模型
def loadModel(path):
    from keras.models import load_model
    model = Sequential()
    model = load_model(path)
    return model

def main(path, modelPath):
    height, width=128, 128
    #載入資料
    X_pred = load_Data(path, height, width)
    model = loadModel(modelPath)
    #編譯模型
    model.compile(loss='categorical_crossentropy', optimizer="adam", metrics=['accuracy'])

    #預測資料
    from sklearn.metrics import accuracy_score,confusion_matrix,classification_report
    y_pred=model.predict(X_pred) 
    y_pred=np.argmax(y_pred, axis=1)
    if(y_pred == 1):
        print('C')
    elif(y_pred == 2):
        print('B')
    else:
        print('A')
    return y_pred

if __name__ == '__main__':
    folderPath=os.path.abspath('.')
    pred = main(folderPath+'/public/img/save_disease_Image/'+sys.argv[1],folderPath+'/py_folder/model/test.h5' )