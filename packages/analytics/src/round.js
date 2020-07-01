import get from 'lodash.get';



export default function round(data, feed){
    if(this.islast()){
        feed.close();
        return;
    }
    const path = this.getParam('path','value');
    const key = Array.isArray(path) ? path.shift() : path;
    const value = Number(get(data, key)) || 0;
    
    rounded = Math.round(value);

    feed.send(data);
}