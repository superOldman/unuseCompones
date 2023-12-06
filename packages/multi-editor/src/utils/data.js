export const config = {
    language: 'zh_CN',      // 界面语言
    referrer_policy: 'origin',
    // language_url: '/languages/zh_CN.js', // 必须将语言包放入langs文件夹内才可以使用language配置语言。如无法实现，则可以使用language_url指定语言包存放的URL
    // height: '',     // 能够指定编辑器的高度
    content_style: `
    [contenteditable="false"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
    }
    ::selection {
        background-color: #165DFFAA;
    }
    `,
    plugins: ['lists', 'table', 'emoticons', 'image'],
    //

    menubar: false,

    /* 底部状态栏相关  相关配置说明 https://www.tiny.cloud/docs/tinymce/6/statusbar-configuration-options/
     * TODO: 字数统计问题需要处理
     * wordcount https://www.tiny.cloud/docs/tinymce/6/wordcount/
     */
    statusbar: false,
    elementpath: false,
    resize: false,
    branding: false
}




const tools1 = [
    "undo", "redo", "bold", "italic", "underline", "strikethrough",
    "forecolor", "backcolor", "alignleft", "aligncenter",
    "alignright", "outdent", "indent", "numlist", "bullist",
    "table", "hr", "removeformat", "emoticons", "image"
]
export const toolbar = [
    tools1.join(' ')
]