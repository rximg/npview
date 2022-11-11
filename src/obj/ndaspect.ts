
import ndarray from 'ndarray'
// import ndarray-imshow from 'ndarray-imshow'
import { Heatmap } from '@antv/g2plot'
import {assignDataToImagedata,formatRGB,formatNumber,colorRGB} from './formats'

interface Size {
  width: number;
  height: number;
}
type HeatMapValue = {
  x: string
  y: string
  rgb?: {r:number,g:number,b:number}
  value: any
}
interface Point {
  x: number;
  y: number;
}
type Region = {
  start: Point
  end: Point
}

interface ImageSize {
  imgX: number;
  imgY: number;
  imgScale: number;
}

interface ImageEl {
  imel: HTMLCanvasElement
  imwidth: number
  imheight: number
}


type AxisType = {
  name: string;
  value: number;
}

const MINSIZES = {
  "DEFAULT": {
    width: 32,
    height: 32,
  }
}

export class NdView {
  store: ndarray;
  ndregion: Region;
  elementSize: Size;
  ndaxis: AxisType[];
  channelMode: "LINE" | "GRAY" | "GRAY_HEATMAP" | "RGB" | "HWC" | "BCHW" | "XCHW" = "RGB";

  constructor(store: ndarray, elsize: Size,) {
    this.store = store;
    this.ndaxis = []
    // this.minPixSize = minPixSize;
    this.elementSize = elsize
    this.ndregion = {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
    }

    this.preprocessND(this.store)
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
    console.log(`preprocessND ${shape} ${dtype} ${this.channelMode}`)
    // this.ndregion = { width: width, height: height }
    // this.ndcenter = { x: width / 2, y: height / 2 }
    this.ndregion = {
      start: { x: 0, y: 0 },
      end: {
        x: this.elementSize.width / MINSIZES['DEFAULT'].width,
        y: this.elementSize.height / MINSIZES['DEFAULT'].height
      }
    }
  }

  get_scroll_region(){
    const region = {
      v_max:this.store.shape[0] - this.elementSize.height / MINSIZES['DEFAULT'].height,
      h_max:this.store.shape[1] - this.elementSize.width / MINSIZES['DEFAULT'].width
    }
    console.log('scroll region',region)
    return region
  }

  set_region(v:number,h:number):void{
    var {x:start_x,y:start_y} = this.ndregion.start;
    var {x:end_x,y:end_y} = this.ndregion.end;
    start_x = v;
    start_y = h;
    end_x = v+this.elementSize.width / MINSIZES['DEFAULT'].width;
    end_y = h+this.elementSize.height / MINSIZES['DEFAULT'].height;
    if (end_x > this.store.shape[0]){
      end_x = this.store.shape[0];
      start_x = end_x - this.elementSize.width/ MINSIZES['DEFAULT'].width;
    }
    if (end_y > this.store.shape[1]){
      end_y = this.store.shape[1];
      start_y = end_y - this.elementSize.height/ MINSIZES['DEFAULT'].height;
    }

    this.ndregion = {
      start: { x: start_x, y: start_y },
      end: { x: end_x, y: end_y }
    }
  }


  getAspect(): ndarray {
    var {x:start_x,y:start_y} = this.ndregion.start
    const {x:end_x,y:end_y} = this.ndregion.end
    console.log('start end', start_x, start_y, end_x, end_y)
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

  getThumbnail(){
    var aspect = null
    if (this.channelMode == "GRAY" || this.channelMode == "GRAY_HEATMAP") {
      aspect = this.store
    } else if (this.channelMode == "RGB") {
      aspect = this.store
    } else if (this.channelMode == "HWC") {   
      aspect = this.store.pick(null, null, this.ndaxis[0].value)
    } else if (this.channelMode == "BCHW") {
      aspect = this.store.pick(this.ndaxis[0].value, null, null, null)
    } else if (this.channelMode == "XCHW") {
      const axis = this.ndaxis.map(axis => axis.value)
      aspect = this.store.pick(...axis)
    } else {
      throw new Error(`unsupport channel mode ${this.channelMode}`)
    }
    // var resize = zeros([this.elementSize.width, this.elementSize.height])
    // resample(resize,aspect)
    return aspect
  }


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

  drawImage(canvas,elsize) {
    canvas.width=elsize.width
    canvas.height=elsize.height
    console.log('draw image in canvas',elsize)
    const context = canvas.getContext('2d')
    const {imel,imwidth,imheight} = this.getImageElement(this.getThumbnail(),context)
    context.clearRect(0, 0, canvas.width, canvas.height)
    // console.log('drawImage',imel,imwidth,imheight,this.scaleShape)
    //https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage
    context.drawImage(
      imel, //规定要使用的图像、画布或视频。
      0,0,//在画布上放置图像的 x 、y坐标位置。
      canvas.width, canvas.height  //要使用的图像的宽度、高度
    );
  }


  viewAsPix(heatmapplot: Heatmap) {

    const data: HeatMapValue[] = []//iter ndarray
    // this.getAspect().
    // const { imgX, imgY, imgScale } = this.scaleShape;
    // const { imel, imwidth, imheight } = this.imageEl

    // this.ndregion = { width: imwidth / imgScale, height: imheight / imgScale }
    // this.ndcenter = { x: (-imgX + imwidth / 2) / imgScale, y: (-imgY + imheight / 2) / imgScale }
    const ndarr = this.getAspect()
    // console.log('aspect:', this.channelMode, ndarr.shape, this.ndregion, this.ndcenter, ndarr.pick(0))
    if (this.channelMode == 'RGB') {
      for (var i = 0; i < ndarr.shape[0]; i++) {
        for (var j = 0; j < ndarr.shape[1]; j++) {
          const r = ndarr.pick(null, null, 0).get(i, j)
          const g = ndarr.pick(null, null, 1).get(i, j)
          const b = ndarr.pick(null, null, 2).get(i, j)
          const mean = (r + g + b) / 3
          data.push({
            x: i.toString(),
            y: j.toString(),
            rgb:{
              r: r,
              g: g,
              b: b,
            },
            value: mean
          })
        }
      }

      // console.log('heat map data',data)
      heatmapplot.update({
        data: data,
        tooltip: false,
        colorField: "rgb",
        label: {
          formatter: formatRGB,
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
            fontSize: 8,
          },
        },
        color:colorRGB
      })
      // heatmapplot.changeSize(this.elsize.width, this.elsize.height)
    } else {
      for (var i = 0; i < ndarr.shape[0]; i++) {
        for (var j = 0; j < ndarr.shape[1]; j++) {
          data.push({
            x: i.toString(),
            y: j.toString(),
            value: ndarr.get(i, j)
          })
        }
      }
      // console.log('heat map data',data)
      heatmapplot.update({
        data: data,
        tooltip:false,
        label: {
          formatter: formatNumber,
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
            fontSize: 8,
          },
        },
        colorField: "value"
      })
      // heatmapplot.changeSize(this.elsize.width, this.elsize.height)
    }

    // heatmapplot.render()
  }
}

