
import ndarray from 'ndarray'
// import ndarray-imshow from 'ndarray-imshow'
import * as ops from 'ndarray-ops'
import { reactive } from "vue"
import { Heatmap } from '@antv/g2plot'

interface Size {
  width: number;
  height: number;
}
type HeatMapValue = {
  x:string
  y:string
  r?:number
  g?:number
  b?:number
  value:any
}
interface Point {
  x: number;
  y: number;
}

interface ImageSize {
  imgX:number;
  imgY:number;
  imgScale: number;
}

interface ImageEl {
  imel:HTMLCanvasElement
  imwidth:number
  imheight:number
}

interface NdViewInterface {

  store: ndarray;
  // canvasSize: Size;
  ndcenter: Point;
  ndregion: Size;
  ndaxis: AxisType[];
  // minPixSize: number;
  viewAsImage(imageShowHandle: HTMLCanvasElement): any;
  viewAsPix(heatmapplot: Heatmap): any;
  // setMousePoint(point: Point): void;
  setScroll(move: number): void;
  setAxis(axis: AxisType[]): void

}

type AxisType = {
  name: string;
  value: number;
}

export class NdView implements NdViewInterface {

  store: ndarray;
  // canvasSize: Size;
  ndcenter: Point;
  ndregion: Size;
  ndaxis: AxisType[];
  // minPixSize: number;
  elsize:Size;
  canvas:HTMLCanvasElement;
  context:CanvasRenderingContext2D;
  scaleShape:ImageSize;
  imageEl:ImageEl;
  oritentMode: "H" | "V" = "H";
  channelMode: "LINE" | "GRAY" | "GRAY_HEATMAP" | "RGB" | "HWC" | "BCHW" | "XCHW" = "RGB";

  constructor(store: ndarray, elsize:Size, canvas:HTMLCanvasElement) {
    this.store = store;
    console.log('init store size', store.width, store.height,canvas)
    this.ndcenter = { x: store.width / 2, y: store.height / 2 }
    this.ndregion = { width: store.width, height: store.height }
    //根据store修改ndaxis
    this.ndaxis = [];
    this.preprocessND(this.store)
    // this.minPixSize = minPixSize;
    this.canvas = canvas
    this.elsize = elsize
    this.canvas.width=elsize.width
    this.canvas.height=elsize.height
    this.context = canvas.getContext('2d')
    this.imageEl = this.getImageElement(this.getAspect(),this.context)
    this.scaleShape = {
      imgX: 0,
      imgY: 0,
      imgScale: 1
    }
    // this.canvasInfo = {
    //   mousePos :{x:0,y:0},
    // }
  }

  preprocessND(nd: ndarray): ndarray {
    // LINE MODE length == 1 unshupport
    // GRAY MODE length == 2 dtype==uint8
    // GRAY HEATMAP MODE length == 2 dtype==?
    // RGB MODE length == 3 dtype==uint8 shape[3]==3
    // HWC MODE length == 3 dtype? c=>axis
    // BCHW MODE length == 4 dtype? b,c=>axis
    // XBCHW MODE length > 4 dtype? x=>axis
    const length = nd.shape.length
    const shape = nd.shape
    const dtype = nd.dtype
    var width = 0
    var height = 0
    if (length < 2) {
      throw new Error(`unsupport ndarray with shape ${shape}`)
    } else if (length == 2) {
      if (dtype == "uint8") {
        this.channelMode = "GRAY"

      } else {
        this.channelMode = "GRAY_HEATMAP"
      }
      height = shape[0]
      width = shape[1]

    }
    else if (nd.shape.length == 3) {
      if (dtype == "uint8" && nd.shape[2] == 3) {
        this.channelMode = "RGB"
      } else {
        this.channelMode = "HWC"
        this.ndaxis.push({ name: "c", value: 0 })
      }
      height = shape[0]
      width = shape[1]
    }
    else if (nd.shape.length == 4) {
      this.channelMode = "BCHW"
      this.ndaxis.push({ name: "c", value: 0 })
      this.ndaxis.push({ name: "b", value: 0 })
      height = shape[2]
      width = shape[3]
    }
    else {
      this.channelMode = "XCHW"
      const num = nd.shape.length - 2
      for (var i = 0; i < num; i++) {
        this.ndaxis.push({ name: `c_${i}`, value: i })
      }
      height = shape[2]
      width = shape[3]
    }
    console.log(`nd info ${shape} ${dtype} ${this.channelMode}`)
    this.ndregion = { width: width, height: height }
    this.ndcenter = { x: width / 2, y: height / 2 }
  }

  getAspect(): ndarray {
    const start_x = this.ndcenter.x - this.ndregion.width / 2;
    const end_x = this.ndcenter.x + this.ndregion.width / 2;
    const start_y = this.ndcenter.y - this.ndregion.height / 2;
    const end_y = this.ndcenter.y + this.ndregion.height / 2;
    console.log('start end',start_x,start_y,end_x,end_y)
    if (this.channelMode == "GRAY" || this.channelMode == "GRAY_HEATMAP") {
      return this.store.hi(end_x, end_y).lo(start_x, start_y)
    } else if (this.channelMode == "RGB") {
      return this.store.hi(end_x, end_y).lo(start_x, start_y)
    } else if (this.channelMode == "HWC") {
      return this.store.hi(end_x, end_y).lo(start_x, start_y).pick(null, null, this.ndaxis[0].value)
    } else if (this.channelMode == "BCHW") {
      return this.store.hi(end_x, end_y).lo(start_x, start_y).pick(this.ndaxis[0].value, null, null, null)
    } else if (this.channelMode == "XCHW") {
      const axis = this.ndaxis.map(axis => axis.value)
      return this.store.hi(end_x, end_y).lo(start_x, start_y).pick(...axis)
    } else {
      throw new Error(`unsupport channel mode ${this.channelMode}`)
    }
  }
  // viewAsImage(imageShowHandle: HTMLCanvasElement) {
  //   // console.log("viewAsImage");
  //   const { width: elwidth, height: elheight } = this.canvasSize
  //   this.canvas = imageShowHandle
  //   this.context = imageShowHandle.getContext('2d')
  //   // imageShowHandle.width = elwidth
  //   // imageShowHandle.height = elheight
  //   // console.log('el size',elwidth,elheight)

  // }

  getImageElement(aspect:ndarray,context:CanvasRenderingContext2D){
    // const aspect = this.getAspect()
    const imwidth = aspect.shape[0]
    const imheight = aspect.shape[1]
    var imageData = context.getImageData(0, 0, imwidth, imheight)
    assignDataToImagedata(aspect, imageData.data)
    const tempCanvas = document.createElement('canvas',) as HTMLCanvasElement;
    tempCanvas.width = imwidth
    tempCanvas.height = imheight

    const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
    
    tempContext.putImageData(imageData, 0, 0);
    console.log("temp",tempCanvas.width,tempCanvas.height,imageData)
    return {
      imel:tempCanvas,
      imwidth:imwidth,
      imheight:imheight
    }
  }

  drawImage() {
    //图片坐标相关的东西都合并到一个object里面去。
    //初始化canvas宽高
    // batch
    // this.context = this.canvas.getContext('2d')
    // const { width: elwidth, height: elheight } = this.canvas
    
    const {imel,imwidth,imheight} = this.imageEl
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    console.log('drawImage',imel,imwidth,imheight,this.scaleShape)
    //https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage
    this.context.drawImage(
      imel, //规定要使用的图像、画布或视频。
      this.scaleShape.imgX, this.scaleShape.imgY,//在画布上放置图像的 x 、y坐标位置。
      imwidth * this.scaleShape.imgScale, imheight * this.scaleShape.imgScale  //要使用的图像的宽度、高度
    );
  }
  viewAsPix(heatmapplot: Heatmap) {

    const data:HeatMapValue[] = []//iter ndarray
    // this.getAspect().
    const {imgX,imgY,imgScale} = this.scaleShape;
    const {imel,imwidth,imheight} = this.imageEl

    this.ndregion = { width: imwidth/imgScale, height: imheight/imgScale }
    this.ndcenter = { x: (-imgX+imwidth/2)/imgScale, y: (-imgY+imheight/2) / imgScale }
    const ndarr = this.getAspect()
    console.log('aspect:',this.channelMode,ndarr.shape,this.ndregion,this.ndcenter,ndarr.pick(0))
    if (this.channelMode=='RGB'){
      for (var i=0;i<ndarr.shape[0];i++){
        for (var j=0;j<ndarr.shape[1];j++){
          const r = ndarr.pick(null,null,0).get(i,j)
          const g = ndarr.pick(null,null,1).get(i,j)
          const b = ndarr.pick(null,null,2).get(i,j)
          const mean = (r+g+b)/3
          data.push({
            x:i.toString(),
            y:j.toString(),
            r:r,
            g:g,
            b:b,
            value:mean
          })
        }
      }

      // console.log('heat map data',data)
      heatmapplot.update({ data: data,
        tooltip: {
          fields: ['x', 'y', 'r','g','b'],
        },
        colorField:"value"
      })
      heatmapplot.changeSize(this.elsize.width,this.elsize.height)
    }else{
      //TODO 图片需要显示成heatmap。
      for (var i=0;i<ndarr.shape[0];i++){
        for (var j=0;j<ndarr.shape[1];j++){
          data.push({
            x:i.toString(),
            y:j.toString(),
            value:ndarr.get(i,j)
          })
        }
      }
      // console.log('heat map data',data)
      heatmapplot.update({ data: data,
        tooltip: {
          fields: ['x', 'y', 'value'],
        },
        colorField:"value"
      })
      heatmapplot.changeSize(this.elsize.width,this.elsize.height)
    }

    // heatmapplot.render()
  }
  // setMousePoint(point: Point) {
  //   const { x, y } = point
  //   this.ndcenter.x = Math.floor((x / this.canvasSize.width) * this.store.width);
  //   this.ndcenter.y = Math.floor((y / this.canvasSize.height) * this.store.height);
  //   // this.ndcenter = point;
  // }
  // setScroll(move: number) {
  //   //TODO 缩放需要有范围
  //   //TODO 什么情况下由 canvas switch到 g2plot
  //   //是否要设置mod，是H,还是V。
  //   this.ndregion.width += move;
  //   this.ndregion.height += move;
  // }
  // setAxis(axis: AxisType[]): void {
  //   this.ndaxis = axis
  // }
}


export function assignDataToImagedata(array, data, frame?): any {
  if (array.shape.length === 4) {
    return assignDataToImagedata(array.pick(frame), data, 0)
  } else if (array.shape.length === 3) {
    if (array.shape[2] === 3) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 3],
          [4, 4 * array.shape[0], 1]),
        array)
      ops.assigns(
        ndarray(data,
          [array.shape[0] * array.shape[1]],
          [4],
          3),
        255)
    } else if (array.shape[2] === 4) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 4],
          [4, array.shape[0] * 4, 1]),
        array)
    } else if (array.shape[2] === 1) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 3],
          [4, 4 * array.shape[0], 1]),
        ndarray(array.data,
          [array.shape[0], array.shape[1], 3],
          [array.stride[0], array.stride[1], 0],
          array.offset))
      ops.assigns(
        ndarray(data,
          [array.shape[0] * array.shape[1]],
          [4],
          3),
        255)
    } else {
      return new Error('Incompatible array shape')
    }
  } else if (array.shape.length === 2) {
    ops.assign(
      ndarray(data,
        [array.shape[0], array.shape[1], 3],
        [4, 4 * array.shape[0], 1]),
      ndarray(array.data,
        [array.shape[0], array.shape[1], 3],
        [array.stride[0], array.stride[1], 0],
        array.offset))
    ops.assigns(
      ndarray(data,
        [array.shape[0] * array.shape[1]],
        [4],
        3),
      255)
  } else {
    return new Error('Incompatible array shape')
  }
  return data
}