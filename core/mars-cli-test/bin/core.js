import path from 'path';
import {exists} from './utils';

// module: webpack 的target属性是web
console.log(path.resolve('.'));
console.log(exists(path.resolve('.')));

(async function(){
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('ok');
})();