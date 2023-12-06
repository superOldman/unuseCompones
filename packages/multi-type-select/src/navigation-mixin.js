export default {
  data() {
    return {
      hoverOption: -1
    };
  },

  computed: {
    optionsAllDisabled() {
      return this.options.filter(option => option.visible).every(option => option.disabled);
    }
  },

  watch: {
    hoverIndex(val) {
      if (typeof val === 'number' && val > -1) {
        this.hoverOption = this.options[val] || {};
      }
      // 屏蔽下面代码是为了解决下拉框将鼠标移开还有hover状态的问题
      // 不用屏蔽了，查看select.vue methods menuLeave方法重置所有选项hover状态
      this.options.forEach(option => {
        option.hover = this.hoverOption === option;
      });
    }
  },

  methods: {
    navigateOptions(direction) {
      return
      if (!this.visible) {
        this.visible = true;
        return;
      }
      if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
      if (!this.optionsAllDisabled) {
        if (direction === 'next') {
          this.hoverIndex++;
          if (this.hoverIndex === this.options.length) {
            this.hoverIndex = 0;
          }
        } else if (direction === 'prev') {
          this.hoverIndex--;
          if (this.hoverIndex < 0) {
            this.hoverIndex = this.options.length - 1;
          }
        }
        const option = this.options[this.hoverIndex];
        if (option.disabled === true ||
          option.groupDisabled === true ||
          !option.visible) {
          this.navigateOptions(direction);
        }
        this.$nextTick(() => this.scrollToOption(this.hoverOption));
      }
    }
  }
};
