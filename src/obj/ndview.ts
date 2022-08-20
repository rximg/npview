
import ndarray from 'ndarray'
import {reactive} from "vue"
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
    canvasSize:Size;
    ndcenter:Point;
    ndregion:Size;
    viewAsImage():any;
    viewAsPix():any;
    setMousePoint(point:Point):void;
    setScroll(move:number):void;

}

class NdView implements NdViewInterface {

    store: ndarray;
    canvasSize:Size;
    ndcenter:Point;
    ndregion:Size;
    constructor(store:ndarray, canvasSize:Size) {
        this.store = store;
        this.canvasSize = reactive(canvasSize);
        this.ndcenter = reactive({x:store.width/2,y:store.height/2})
        this.ndregion = reactive({width:store.width,height:store.height})
    }
    viewAsImage() {
        console.log("viewAsImage");
    }
    viewAsPix() {
        console.log("viewAsPix");
    }
    setMousePoint(point:Point) {
        const {x,y} = point
        this.ndcenter.x = Math.floor((x/this.canvasSize.width)*this.store.width);
        this.ndcenter.y = Math.floor((y/this.canvasSize.height)*this.store.height);
        // this.ndcenter = point;
    }
    setScroll(move:number) {
        //TODO 缩放需要有范围
        this.ndregion.width += move;
        this.ndregion.height += move;
    }
}