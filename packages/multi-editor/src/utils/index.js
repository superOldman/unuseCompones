// import html2canvas from 'html2canvas';

export function delegate(parentElement, eventType, selector, handler) {
    parentElement.addEventListener(eventType, function (event) {
        // 检查事件的目标元素是否匹配选择器
        if (event.target.matches(selector)) {
            // 调用处理程序并传递事件对象
            handler(event);
        }
    });
}
// export function generateImageFromDOM(domString) {
//     return new Promise((resolve, reject) => {
//         const domElement = document.createElement('div');
//         domElement.setAttribute('style', "position:absolute;top:0px;left:0;max-width:200px;")
//         domElement.setAttribute('class', "ta-mce-button")
//         domElement.innerHTML = domString;
//         document.body.appendChild(domElement);
//         setTimeout(() => {
//             html2canvas(domElement).then(canvas => {
//                 const image = canvas.toDataURL('image/png');
//                 const width = domElement.offsetWidth;
//                 const height = domElement.offsetHeight;
//                 // document.body.removeChild(domElement);
//                 resolve({ image, width, height });
//             }).catch(error => {
//                 document.body.removeChild(domElement);
//                 reject(error);
//             });
//         }, 0);
//
//     });
// }

// 同步生成文字图片
export function generateImageDataURLFromDOM(domString) {
    const divElement = document.createElement('div');
    divElement.setAttribute('style', "position:absolute;top:0px;left:0;")
    divElement.setAttribute('class', "ta-mce-button")
    divElement.innerHTML = domString
    document.body.appendChild(divElement)

    const canvas = document.createElement('canvas')
    // 设置<canvas>元素的宽度和高度与<div>元素相同
    canvas.width = divElement.offsetWidth
    canvas.height = divElement.offsetHeight
    divElement.remove()
    // 获取<canvas>的2D上下文
    const context = canvas.getContext('2d')
    const text = divElement.innerText
    // console.log('text', text)
    const x = 0;
    const y = 0;
    const width = canvas.width;
    const height = canvas.height;
    const borderRadius = 4;
    // 绘制圆角效果
    context.beginPath()
    context.moveTo(x + borderRadius, y)
    context.lineTo(x + width - borderRadius, y)
    context.quadraticCurveTo(x + width, y, x + width, y + borderRadius)
    context.lineTo(x + width, y + height - borderRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height)
    context.lineTo(x + borderRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - borderRadius)
    context.lineTo(x, y + borderRadius)
    context.quadraticCurveTo(x, y, x + borderRadius, y)
    context.closePath()
    context.clip()
    context.fillStyle = '#F2F2F2'
    context.fillRect(x, y, width, height)

    context.font = "14px Arial"
    context.textAlign = 'center'
    context.fillStyle = '#1D2129'
    context.fillText(text, canvas.width / 2, canvas.height * 3 / 4)

    const dataURL = canvas.toDataURL('image/png')
    return {
        dataURL,
        image: dataURL,
        width: canvas.width,
        height: canvas.height,
    }
}

// 解析富文本编辑器内容
export function getContentText(data) {
    let dom = document.createElement('div')
    let value = ''
    dom.innerHTML = data
    for (const box of dom.childNodes) {
        for (const node of box.childNodes) {
            if (node.nodeName == '#text') {
                value += node.textContent
            } else {
                for (const n of node.childNodes) {
                    value += n.textContent
                }
            }
        }
        if (box != dom.childNodes[dom.childNodes.length - 1]) {
            value += '\n'
        }
    }
    return value
}


export function getImgAttributes(htmlString) {
    const imgRegex = /<img[^>]+>/g; // 匹配 img 标签的正则表达式
    const attrRegex = /(data-ta-\w+(?:-\w+)*)\s*=\s*["']([^"']+)["']/g; // 匹配属性及属性值的正则表达式
    const imgAttrs = [];
    const imgTags = htmlString.match(imgRegex); // 匹配所有的 img 标签
    if (imgTags) {
        imgTags.forEach((imgTag) => {
            const attrs = {};
            let match;
            while ((match = attrRegex.exec(imgTag)) !== null) {
                const attr = match[1]; // 属性名
                const value = match[2]; // 属性值
                attrs[attr] = value;
            }

            imgAttrs.push(attrs);
        });
    }
    return imgAttrs;
}


export function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}

export function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}


let isFunction = (functionToCheck) => {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

if (typeof /./ !== 'function' && typeof Int8Array !== 'object' && (typeof document.childNodes !== 'function')) {
    isFunction = function (obj) {
        return typeof obj === 'function' || false;
    };
}

export {
    isFunction
};
