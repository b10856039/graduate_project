

# from keras.preprocessing import image
# from keras.models import Sequential,load_model
# import numpy as np
# import cv2
# from keras.utils import load_img,img_to_array
# from keras.layers import BatchNormalization
# import sys
# import os
# import json

# folderPath=os.path.abspath('.')



# img = cv2.imread(folderPath+'/public/img/save_disease_Image/'+sys.argv[1])
# img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
# img = cv2.resize(img, (224,224))
# img = np.reshape(img,(1,224,224,3))

# model = Sequential()
# model = load_model(folderPath+'/py_folder/model/lemon_224.h5')#,custom_objects={'BatchNormalization':BatchNormalization}
# pred = model.predict(img)
# # print(pred)
# if pred[0][0]<pred[0][1]:
#     print('生病')
# elif pred[0][0]>pred[0][1]:
#     print('健康')
# else:
#     print('error')



#備份

import sys
import os
import json

import cv2
import numpy as np
from keras.models import Sequential


def imshow(title, img):
    cv2.imshow(title, img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

#載入資料
def load_Data(path, size):
    # print('Files:',path)
    X=list()
    contrast, brightness = 100, 40
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    img = cv2.resize(img, size)
    img = img * (contrast/127 + 1) - contrast + brightness
    img = np.uint8(np.clip(img, 0, 255))
    # imshow(path, img)
    X.append(img)
    X = np.array(X)
    #print(X.shape)
    return X

#定義模型
def loadModel(path):
    from keras.models import load_model
    model = Sequential()
    model = load_model(path)
    #model.summary()
    return model

def main(modelPath, imagePath):
    identify = ['黑星黑斑', '健康', '銹皮病', '瘡痂病', '薊馬']
    img_size=(128, 128)
    pred = load_Data(imagePath, img_size) #載入資料
    model = loadModel(modelPath) #載入模型
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy']) #編譯模型
    predict=model.predict(pred) #預測結果
    predict=np.argmax(predict, axis=1)[0]
    #print(predict)
    return identify[predict]

if __name__ == '__main__':
    folderPath=os.path.abspath('.')
    identify = main(folderPath+'/py_folder/model/lemon.h5',folderPath+'/public/img/save_disease_Image/'+sys.argv[1])
    print(identify)
    #return identify