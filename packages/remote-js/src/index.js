const remoteMap = {};
const remoteArrMap = {};
export default {
  name: "DsRemoteJs",
  props: {
    src: { type: String, required: true }
  },
  mounted() {
    if (!remoteArrMap[this.src]) {
      remoteArrMap[this.src] = []
    }
    remoteArrMap[this.src].push(this)
  },
  render(createElement) {
    if (!this.src) return
    const self = this
    let script = ""
    if (remoteMap[this.src] && remoteMap[this.src].then) {
      remoteMap[this.src].then(() => {
        self.$emit('loaded')
      }).catch(error => console.log('[DsRemoteJs error]:', error))
    } else {
      remoteMap[this.src] = new Promise((resolve, reject) => {
        script = createElement('script', {
          attrs: { type: 'text/javascript', src: this.src },
          on: {
            load: function () {
              console.log('load js')
              self.$emit('loaded')
              resolve()
            }
          }
        })
      })
    }
    return script
  },
  beforeDestroy() {
    if (!this.src) return
    remoteArrMap[this.src] = remoteArrMap[this.src].filter(v => v !== this);
    if (!remoteArrMap[this.src].length) {
      delete remoteMap[this.src]
    }
  }
}