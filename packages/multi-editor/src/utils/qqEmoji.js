export const qqFaceArr = {
    '[微笑]': '0',
    '[撇嘴]': '1',
    '[色]': '2',
    '[发呆]': '3',
    '[得意]': '4',
    '[流泪]': '5',
    '[害羞]': '6',
    '[闭嘴]': '7',
    '[睡]': '8',
    '[大哭]': '9',
    '[尴尬]': '10',
    '[发怒]': '11',
    '[调皮]': '12',
    '[呲牙]': '13',
    '[惊讶]': '14',
    '[难过]': '15',
    '[囧]': '16',
    '[抓狂]': '17',
    '[吐]': '18',
    '[偷笑]': '19',
    '[愉快]': '20',
    '[白眼]': '21',
    '[傲慢]': '22',
    '[困]': '23',
    '[惊恐]': '24',
    '[憨笑]': '25',
    '[悠闲]': '26',
    '[咒骂]': '27',
    '[疑问]': '28',
    '[嘘]': '29',
    '[晕]': '30',
    '[衰]': '31',
    '[骷髅]': '32',
    '[敲打]': '33',
    '[再见]': '34',
    '[擦汗]': '35',
    '[抠鼻]': '36',
    '[鼓掌]': '37',
    '[坏笑]': '38',
    '[右哼哼]': '39',
    '[鄙视]': '40',
    '[委屈]': '41',
    '[快哭了]': '42',
    '[阴险]': '43',
    '[亲亲]': '44',
    '[可怜]': '45',
    '[笑脸]': '46',
    '[生病]': '47',
    '[脸红]': '48',
    '[破涕为笑]': '49',
    '[恐惧]': '50',
    '[失望]': '51',
    '[无语]': '52',
    '[嘿哈]': '53',
    '[捂脸]': '54',
    '[奸笑]': '55',
    '[机智]': '56',
    '[皱眉]': '57',
    '[耶]': '58',
    '[吃瓜]': '59',
    '[加油]': '60',
    '[汗]': '61',
    '[天啊]': '62',
    '[Emm]': '63',
    '[社会社会]': '64',
    '[旺柴]': '65',
    '[好的]': '66',
    '[打脸]': '67',
    '[哇]': '68',
    '[翻白眼]': '69',
    '[666]': '70',
    '[让我看看]': '71',
    '[叹气]': '72',
    '[苦涩]': '73',
    '[裂开]': '74',
    '[嘴唇]': '75',
    '[爱心]': '76',
    '[心碎]': '77',
    '[拥抱]': '78',
    '[强]': '79',
    '[弱]': '80',
    '[握手]': '81',
    '[胜利]': '82',
    '[抱拳]': '83',
    '[勾引]': '84',
    '[拳头]': '85',
    '[OK]': '86',
    '[合十]': '87',
    '[啤酒]': '88',
    '[咖啡]': '89',
    '[蛋糕]': '90',
    '[玫瑰]': '91',
    '[凋谢]': '92',
    '[菜刀]': '93',
    '[炸弹]': '94',
    '[便便]': '95',
    '[月亮]': '96',
    '[太阳]': '97',
    '[庆祝]': '98',
    '[礼物]': '99',
    '[红包]': '100',
    '[發]': '101',
    '[福]': '102',
    '[烟花]': '103',
    '[爆竹]': '104',
    '[猪头]': '105',
    '[跳跳]': '106',
    '[发抖]': '107',
    '[转圈]': '108'
}
const qqFaceIconArr = []
for (const [key, value] of Object.entries(qqFaceArr)) {
    qqFaceIconArr.push({ label: key, value, url: `https://tservice.71360.com/download/scrm/emoji/${value}.png` })
}
export const qqFaceIcons = qqFaceIconArr

export function getEmojiSpan(emoji) {
    const index = qqFaceArr[emoji]
    if (!index) return emoji
    const item = qqFaceIcons[index]
    if (!item) return emoji
    return `<span contenteditable="false" style="margin: 0;width: 28px; height: 28px; background-size: cover; background-image: url(${item.url}); display: inline-flex;"><span style="clip-path:circle(0% at 50% 50%); width:28px;height:28px;display:inline-block;overflow:hidden;visibility:hidden;">${item.label}</span></span>`
}