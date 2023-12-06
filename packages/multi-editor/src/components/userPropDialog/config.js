import { generateImageDataURLFromDOM } from 'packages/multi-editor/src/utils'
const context = require.context('./', true, /^\.\/[^/]*?\/config.js$/)
const match = context.id.match(/\/([^/]+Dialog)\s+sync/);
const compDialog = match && match.length > 1 ? match[1] : ""

export const getElement = (item, img) => {
    // console.log('item123', item)
    // console.log('img', img)
    if (!img) {
        img = document.createElement('img')
    }
    const type = item.type
    const prop = item.prop
    const value = item.value || ''
    const label = item.label || ''
    img.setAttribute('data-emoticon', true)
    img.setAttribute('data-mce-resize', "false")
    img.setAttribute('data-mce-placeholder', true)
    img.setAttribute('draggable', false)
    img.setAttribute('data-ta-use', 'userPropDialog')
    img.setAttribute('data-ta-type', "text")
    img.setAttribute('data-ta-value', `${type}:${prop}:${value}:${label}`)
    img.setAttribute('title', `${prop}: ${value}`)
    img.style.display = 'none'
    // generateImageFromDOM(`<span style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.prop}</span>`).then(({ image, width, height }) => {
    //   img = document.querySelector(`img[data-ta-value="${item.type}:${item.prop}:${item.value}"]`) || img
    //   // console.log(2222222222, document.querySelector(`img[data-ta-value="${item.type}:${item.prop}:${item.value}"]`))
    //   img.style = `vertical-align:bottom;outline:none;width:${width}px;height:${height}px;cursor:pointer;margin:0 1px;`
    //   img.src = image
    // }).catch(() => {
    // })
    const { image, width, height } = generateImageDataURLFromDOM(`<span style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label || prop}</span>`)
    img.style = `vertical-align:bottom;outline:none;width:${width}px;height:${height}px;cursor:pointer;margin:0 1px;`
    img.src = image
    return img
}

export default {

    toolOptions: {
        icon: 'ta-plus',
        text: '用户属性',
        onAction: (vm, editor, api) => {
            vm.doShowDialog(compDialog)
            // console.log('------------onAction', vm, editor, api)
        }
    },
    htmlReg: /<img[^>]+?data-ta-use="userPropDialog"[^>]*?>/g,
    textReg: /\{.+:.*?}/g,
    convertHtmlToText(html) {
        const text = html.replace(/^[^>]+?data-ta-value="([^"]+)[^<]+$/, '$1')
        return `{${text}}`
    },
    convertTextToHtml(text) {
        // START 旧数据兼容
        if (/^\{(linkId|shortUrl|event):.+}$/.test(text)) {
            return text
        } else if (/\{[^:]+:[^:]*?}/) {
            const [_, prop, value] = text.match(/\{([^:]+):([^:]*?)}/)
            text = `{FIELD:${prop}:${value || ''}:}`
        }
        // END
        const [_, type, prop, value, label] = text.match(/\{(FIELD):([^:]*):?([^:]*):?(.*)}/)
        const item = { type, prop, value, label }
        // console.log('item', item)
        const img = getElement(item)
        return img.outerHTML
    },
    textLengthFn(text) {
        const textLength = 15
        return new Array(textLength).fill('*').join('')
    }
}
