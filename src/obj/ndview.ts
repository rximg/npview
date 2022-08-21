
import ndarray from 'ndarray'
// import ndarray-imshow from 'ndarray-imshow'
import * as ops from 'ndarray-ops'
import { reactive } from "vue"
import { Heatmap } from '@antv/g2plot'

interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface NdViewInterface {

  store: ndarray;
  canvasSize: Size;
  ndcenter: Point;
  ndregion: Size;
  ndaxis: AxisType[];
  minPixSize: number;
  viewAsImage(imageShowHandle:HTMLCanvasElement): any;
  viewAsPix(heatmapplot:Heatmap): any;
  setMousePoint(point: Point): void;
  setScroll(move: number): void;
  setAxis(axis: AxisType[]): void

}

type AxisType = {
  name: string;
  value: number;
}

export class NdView implements NdViewInterface {

  store: ndarray;
  canvasSize: Size;
  ndcenter: Point;
  ndregion: Size;
  ndaxis: AxisType[];
  minPixSize: number;
  oritentMode: "H" | "V" = "H";
  channelMode: "LINE" | "GRAY" | "GRAY_HEATMAP" | "RGB" | "HWC" | "BCHW" | "XCHW" = "RGB";

  constructor(store: ndarray, canvasSize: Size, minPixSize: number = 8) {
    this.store = store;
    this.canvasSize = canvasSize;
    this.ndcenter = { x: store.width / 2, y: store.height / 2 }
    this.ndregion = { width: store.width, height: store.height }
    //根据store修改ndaxis
    this.ndaxis = [];
    this.preprocessND(this.store)
    this.minPixSize = minPixSize;
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
    if (length < 2) {
      throw new Error(`unsupport ndarray with shape ${shape}`)
    } else if (length == 2) {
      if (dtype == "uint8") {
        this.channelMode = "GRAY"
      } else {
        this.channelMode = "GRAY_HEATMAP"
      }
    }
    else if (nd.shape.length == 3) {
      if (dtype == "uint8" && nd.shape[2]==3) {
        this.channelMode = "RGB"
      } else {
        this.channelMode = "HWC"
        this.ndaxis.push({ name: "c", value: 0 })
      }
    }
    else if (nd.shape.length == 4) {
      this.channelMode = "BCHW"
      this.ndaxis.push({ name: "c", value: 0 })
      this.ndaxis.push({ name: "b", value: 0 })
    }
    else {
      this.channelMode = "XCHW"
      const num = nd.shape.length - 2
      for (var i = 0; i < num; i++) {
        this.ndaxis.push({ name: `c_${i}`, value: i })
      }
    }
    console.log(`nd info ${shape} ${dtype} ${this.channelMode}`)

  }

  getAspect():ndarray{
    const start_x = this.ndcenter.x - this.ndregion.width / 2;
    const end_x = this.ndcenter.x + this.ndregion.width / 2;
    const start_y = this.ndcenter.y - this.ndregion.height / 2;
    const end_y = this.ndcenter.y + this.ndregion.height / 2; 
    if (this.channelMode == "GRAY" || this.channelMode=="GRAY_HEATMAP"){
      return this.store.lo(start_x,start_y).hi(end_x,end_y)
    }else if(this.channelMode == "RGB"){
      return this.store.lo(start_x,start_y).hi(end_x,end_y)
    }else if (this.channelMode == "HWC"){
      return this.store.lo(start_x,start_y).hi(end_x,end_y).pick(null,null,this.ndaxis[0].value)
    }else if (this.channelMode == "BCHW"){
      return this.store.lo(start_x,start_y).hi(end_x,end_y).pick(this.ndaxis[0].value,null,null,null)
    }else if (this.channelMode =="XCHW"){
      const axis = this.ndaxis.map(axis => axis.value)
      return this.store.lo(start_x,start_y).hi(end_x,end_y).pick(...axis)
    }else{
      throw new Error(`unsupport channel mode ${this.channelMode}`)
    }
  }
  viewAsImage(imageShowHandle:HTMLCanvasElement) {
    // console.log("viewAsImage");
    const {width:elwidth,height:elheight} = this.canvasSize
    var context = imageShowHandle.getContext('2d')
    imageShowHandle.width = elwidth
    imageShowHandle.height = elheight
    console.log('el size',elwidth,elheight)
    var imageData = context.getImageData(0, 0, elwidth, elheight)
    var data = imageData.data
    data = handleData(this.store, data)
    console.log('data',this.store,data)
    context.putImageData(imageData, 0, 0)
  }
  viewAsPix(heatmapplot:Heatmap) {
    const data = {}//iter ndarray
    // this.getAspect().
    
    heatmapplot.update({data:data})
  }
  setMousePoint(point: Point) {
    const { x, y } = point
    this.ndcenter.x = Math.floor((x / this.canvasSize.width) * this.store.width);
    this.ndcenter.y = Math.floor((y / this.canvasSize.height) * this.store.height);
    // this.ndcenter = point;
  }
  setScroll(move: number) {
    //TODO 缩放需要有范围
    //TODO 什么情况下由 canvas switch到 g2plot
    //是否要设置mod，是H,还是V。
    this.ndregion.width += move;
    this.ndregion.height += move;
  }
  setAxis(axis: AxisType[]): void {
    this.ndaxis = axis
  }
}


export function handleData(array, data, frame?): any {
  var i, j, ptr = 0, c

  if (array.shape.length === 4) {
    return handleData(array.pick(frame), data, 0)
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