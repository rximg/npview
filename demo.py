# import numpy as np
# img = np.zeros((256,256,3),dtype=float)
# img[...,0] = np.linspace(0,255,256)
# img[...,1] = np.linspace(0,255,256).reshape((-1,1))
# x= (255-img)
# x = x.astype('uint8')
# print(x)
# np.save('zero',x)

import numpy as np

import cv2


im = cv2.imread(r"C:\Users\kk\Desktop\12.png")
im = cv2.cvtColor(im,cv2.COLOR_RGB2BGR)
im = np.transpose(im,(1,0,2))
print(im.shape)
np.save('12.npy',im)