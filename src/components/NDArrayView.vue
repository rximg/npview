<template>
  <div ref="mainNDView" @mousewheel.prevent="scrollevent" @mousedown="onmousedown" @mouseup="onmouseup"
    :style="{ width: '200px', height: '200px' }">
      <canvas ref="imageShowHandle" />
    <!-- <div v-show="isImageShow"> -->
    <!-- </div> -->
    <div v-show="!isImageShow">
      <div ref="pixShowHandle"></div>
    </div>
    <div>
    </div>
  </div>

</template>


<script lang="ts" setup>
import { reactive, onMounted, ref, type Ref } from "vue"
import { NdView } from "../obj/ndview"
import { Heatmap } from '@antv/g2plot'

import { useElementSize } from '@vueuse/core'
const props = defineProps(['inputarr'])
// console.log('input data',props.inputarr)

const imageShowHandle: Ref<HTMLCanvasElement> = ref(null)
const pixShowHandle: Ref<HTMLElement> = ref(null)
const mainNDViewHandle = ref(null)
const isImageShow = ref(true)
var ndview_ist: NdView = null
const { width: elwidth, height: elheight } = useElementSize(mainNDViewHandle)
// const ndaxis = reactive(ndview_ist.ndaxis)
// const scrollevent = (event) => {
//   console.log(event)
//   var delta = 0
//   if (!event) event = window.event
//   if (event.wheelDelta) {
//     delta = event.wheelDelta / 120
//     if (window.opera) delta = -delta
//   } else if (event.detail) {
//     delta = -event.detail / 3
//   }
//   ndview_ist.setScroll(delta)
//   ndview_ist.viewAsImage(imageShowHandle.value)

// if (ndview_ist.ndregion.width>8){
//   ndview_ist.viewAsImage(imageShowHandle.value)
// }else{
//   ndview_ist.viewAsPix(heatmapPlot)
// }
// }
var canvas;
var img,//图片对象
  imgIsLoaded,//图片是否加载完成;
  imgX = 0,
  imgY = 0,
  imgScale = 1;

// function loadImg() {
//   img = new Image();
//   img.onload = function () {
//     imgIsLoaded = true;
//     ndview_ist.drawImage();
//   }
//   img.src = '../../Content/images/mayday.jpg';
// }

// function drawImage() {
//   img = ndview_ist.getAspect()
//   const context = imageShowHandle.value.getContext('2d');//画布显示二维图片
//   context.clearRect(0, 0, imageShowHandle.value.width, imageShowHandle.value.height);
//   context.drawImage(
//     img, //规定要使用的图像、画布或视频。
//     0, 0, //开始剪切的 x 坐标位置。
//     img.width, img.height,  //被剪切图像的高度。
//     imgX, imgY,//在画布上放置图像的 x 、y坐标位置。
//     img.width * imgScale, img.height * imgScale  //要使用的图像的宽度、高度
//   );
// }
const scrollevent = function (event) {    //滚轮放大缩小
  var pos = windowToCanvas(event.clientX, event.clientY);
  var wheelDelta = event.wheelDelta ? event.wheelDelta : (event.deltalY * (-40));  //获取当前鼠标的滚动情况
  if (wheelDelta > 0) {
    ndview_ist.imageSize.imgScale *= 2;
    ndview_ist.imageSize.imgX = ndview_ist.imageSize.imgX * 2 - pos.x;
    ndview_ist.imageSize.imgY = ndview_ist.imageSize.imgY * 2 - pos.y;
  } else {
    ndview_ist.imageSize.imgScale /= 2;
    ndview_ist.imageSize.imgX = ndview_ist.imageSize.imgX * 0.5 - pos.x * 0.5;
    ndview_ist.imageSize.imgY = ndview_ist.imageSize.imgY * 0.5 - pos.y * 0.5;
  }
  ndview_ist.drawImage();   //重新绘制图片
};

const onmousedown = function (event) {
  var pos = windowToCanvas(event.clientX, event.clientY);  //坐标转换，将窗口坐标转换成canvas的坐标

  imageShowHandle.value.onmousemove = function (evt) {  //移动
    imageShowHandle.value.style.cursor = 'move';
    var posl = windowToCanvas(evt.clientX, evt.clientY);
    var x = posl.x - pos.x;
    var y = posl.y - pos.y;
    pos = posl;
    ndview_ist.imageSize.imgX = x;
    ndview_ist.imageSize.imgY = y;
    ndview_ist.drawImage();  //重新绘制图片
  };
}
const onmouseup = function () {
  imageShowHandle.value.onmousemove = null;
  imageShowHandle.value.onmouseup = null;
  imageShowHandle.value.style.cursor = 'default';
};

/*坐标转换*/
function windowToCanvas(x, y) {
  var box = imageShowHandle.value.getBoundingClientRect();  //这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离
  return {
    x: x - box.left - (box.width - imageShowHandle.value.width) / 2,
    y: y - box.top - (box.height - imageShowHandle.value.height) / 2
  };
}
var heatmapPlot = null
onMounted(
  () => {
    // canvasEventsInit()
    //context = imageShowHandle.value.getContext('2d');//画布显示二维图片
    ndview_ist = new NdView(props.inputarr, { width: 256, height: 256 },8,canvas=imageShowHandle.value)
    // ndview_ist.viewAsImage();
    ndview_ist.drawImage()
    //ndview_ist.viewAsImage(imageShowHandle.value)
    heatmapPlot = new Heatmap(
      pixShowHandle.value,
      {
        xField: 'x',
        yField: 'y',
        xAxis: false,
        yAxis: false,
        colorField: 'v',
        color: ['#dddddd', '#9ec8e0', '#5fa4cd', '#2e7ab6', '#114d90'],
        tooltip: {
          fields: ['x', 'y', 'v'],
        },
        reflect: 'y',
        label: {
          formatter: (datum) => datum.format,
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
            fontSize: 8,
          },
        },
        axis: false,
        data: {},
        autoFit: false,
        width: elwidth,
        height: elheight,
      }
    )
    heatmapPlot.render()
  }
)




</script>