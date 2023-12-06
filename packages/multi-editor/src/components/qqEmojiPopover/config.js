import { qqFaceIcons } from "packages/multi-editor/src/utils/qqEmoji"
const context = require.context('./', true, /^\.\/[^/]*?\/config.js$/)
const match = context.id.match(/\/([^/]+Popover)\s+sync/);
const compPopover = match && match.length > 1 ? match[1] : ""

function getToolButton(vm, callback) {
    const buttons = Array.from(vm.$el.querySelectorAll('.tox-toolbar__group .tox-tbtn'))
    // if (buttons && buttons.length && !buttons[0].innerText) {
    //     setTimeout(() => {
    //         getToolButton(vm, callback)
    //     }, 10000);
    //     return
    // }
    callback && callback(buttons.find(v => {
        // console.log('v.innerText', v.innerText)
        return v.innerText.includes("表情")
    }))
}
export const getEmojiElement = (item) => {
    const img = document.createElement('img')
    img.setAttribute('data-emoticon', "false")
    img.setAttribute('data-mce-resize', "false")
    img.setAttribute('data-mce-placeholder', "true")
    img.setAttribute('draggable', "false")
    img.setAttribute('data-ta-value', item.label)
    img.style = "vertical-align:bottom;outline:none;width:24px;height:24px;"
    img.src = item.url
    return img
}

export default {
    compPopoverOptions: function (vm) {
        return {
            trigger: 'click',
            width: '364',
            placement: "bottom-start"
        }
    },
    toolOptions: {
        text: '表情',
        icon: 'ta-plus',
        onAction: (vm, editor, api) => {
            // console.log('------------onAction', vm, editor, api)
        },
        onSetup: (vm, editor, api) => {
            getToolButton(vm, button => {
                vm.$set(vm.compPopoverMap[compPopover], 'reference', button)
            })
        },
    },
    htmlReg: /<img[^>]+?data-ta-value="\[[\u4e00-\u9fa5]{1,4}]"[^>]*?>/g,
    textReg: /\[[\u4e00-\u9fa5]{1,4}]/g,
    convertHtmlToText(html) {
        // console.log('html', html)
        const text = html.replace(/^[^>]+?data-ta-value="([^"]+)[^<]+$/, '$1')
        // console.log('text', text)
        return text
    },
    convertTextToHtml(text) {
        console.log('text111', text)
        const target = qqFaceIcons.find(v => v.label == text)
        if (target) {
            const img = getEmojiElement(target)
            console.log('img.outerHTML', img.outerHTML)
            return img.outerHTML
        }
        return text
    }
}
