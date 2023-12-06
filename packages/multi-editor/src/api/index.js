import { userData } from "packages/multi-editor/src/api/data"
export function getLabel() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(userData)
        }, 1500);
    })
}
