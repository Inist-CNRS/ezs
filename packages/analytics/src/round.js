import get from 'lodash.get';
import core from './core';
/**
 * 
 * @name round
 * @param {String} [path=value]
 * @returns {Object}
 */

export default function round(data, feed){
    if(this.isLast()){
        feed.close();
        return;
    }
    const path = this.getParam('path','value');
    const type = this.getParam('type','arrondi');
    const key = Array.isArray(path) ? path.shift() : path;
    var value = Number(get(data, key)) || 0;
    if(type == 'arrondi'){
        var rounded = Math.round(value);
    }
    if(type == 'default'){
        var rounded = Math.floor(value);
    }
    if(type == 'excess'){
        var rounded = Math.ceil(value);
    }
    data = rounded;
   
    feed.send(data);
    //feed.end();
}