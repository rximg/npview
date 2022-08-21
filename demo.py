import numpy as np
img = np.zeros((256,256,3),dtype=float)
img[...,0] = np.linspace(0,255,256)
img[...,1] = np.linspace(0,255,256).reshape((-1,1))
x= (255-img)
x = x.astype('uint8')
print(x)
np.save('zero',x[:,:,0])