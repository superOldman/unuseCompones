/*
 * @Author: snl.yin 
 * @Date: 2022-01-21 15:02:31 
 * @Last Modified by: snl.yin
 * @Last Modified time: 2023-12-04 11:44:50
 */

import { isString, isArray, isObject, isFunction } from "./types"
import { v4 as uuidV4 } from 'uuid'
import _, { cloneDeep } from "lodash"


export function createUUID() {
    return uuidV4()
}

export function toUUIDObject(obj) {
    if (!obj) return obj
    if (!isObject(obj)) return obj
    return { ...obj, _uuid: createUUID() }
}


/**
 * 递归trim对象
 * @param 原对象
 * @return trim后的对象  
 */
export const objectTrim = (obj) => {
    if (isString(obj)) {
        return obj.trim()
    } else if (isArray(obj)) {
        return obj.map((v, i) => objectTrim(v))
    } else if (isObject(obj)) {
        return Object.keys(obj).reduce((p, n) => (p[n] = objectTrim(obj[n]), p), {})
    } else {
        return obj
    }
}

/**
 * 深拷贝
 * @param 原对象
 * @return 拷贝后的对象 
 */
export const deepClone = (obj) => {
    if (!obj) return obj
    return _.cloneDeep(obj)
}


function omitInnerFunc(obj, keys) {
    for (let prop in obj) {
        if (keys.some(v => v == prop)) {
            delete obj[prop];
        } else if (isObject(obj[prop])) {
            omitInnerFunc(obj[prop], keys);
        } else if (isArray(obj[prop])) {
            obj[prop].forEach(v => {
                if (isObject(v)) {
                    omitInnerFunc(v, keys);
                }
            });
        }
    }
}
export function omit(obj, keys) {
    keys = keys || []
    if (!obj) return obj
    obj = deepClone(obj)
    omitInnerFunc(obj, keys)
    return obj
}



function insertInnerFunc(obj, key, value) {
    obj[key] = isFunction(value) ? value() : value
    for (let prop in obj) {
        if (isObject(obj[prop])) {
            insertInnerFunc(obj[prop], key, value);
        } else if (isArray(obj[prop])) {
            obj[prop].forEach(v => {
                if (isObject(v)) {
                    insertInnerFunc(v, key, value);
                }
            });
        }
    }
}
export function insert(obj, key, value) {
    if (!obj || !key) return obj
    obj = deepClone(obj)
    insertInnerFunc(obj, key, value)
    return obj
}


function replaceInnerFunc(obj, key, value) {
    if (obj.hasOwnProperty(key)) {
        obj[key] = isFunction(value) ? value(obj[key], obj) : value
    }
    for (let prop in obj) {
        if (isObject(obj[prop])) {
            replaceInnerFunc(obj[prop], key, value);
        } else if (isArray(obj[prop])) {
            obj[prop].forEach(v => {
                if (isObject(v)) {
                    replaceInnerFunc(v, key, value);
                }
            });
        }
    }
}

export function replace(obj, key, value) {
    if (!obj || !key) return obj
    obj = deepClone(obj)
    replaceInnerFunc(obj, key, value)
    return obj
}