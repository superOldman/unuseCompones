const INLINE_ELEMENTS = require('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')
module.exports = {
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  "rules": {
    "no-empty": 1,
    "no-unused-vars": 1,
    "no-undef": 0,
    "no-prototype-builtins": 0,
    "no-sparse-arrays": 0,
    "no-useless-escape": 0,
    "no-inner-declarations": 1,
    "no-irregular-whitespace": 1,
    "no-control-regex": 1,
    "no-misleading-character-class": 1,
    "no-extra-semi": 1,         // 警告方法后面的分号
    "vue/no-reserved-keys": 1,
    "vue/html-self-closing": "off",
    "vue/multi-word-component-names": 0,
    "vue/no-mutating-props": 1,
    "vue/no-unused-vars": 1,
    "vue/require-prop-type-constructor": 0,
    "vue/no-side-effects-in-computed-properties": 1,
    "vue/no-use-v-if-with-v-for": 1,        // v-for v-if
    "vue/no-unused-components": 1,
    "vue/order-in-components": [ // vue文档顺序
      "error",
      {
        "order": [
          "el",
          "name",
          "key",
          "parent",
          "functional",
          [
            "delimiters",
            "comments"
          ],
          [
            "components",
            "directives",
            "filters"
          ],
          "extends",
          "mixins",
          [
            "provide",
            "inject"
          ],
          "layout",
          "middleware",
          "validate",
          "scrollToTop",
          "transition",
          "loading",
          "inheritAttrs",
          "model",
          "emits",
          "setup",
          "fetch",
          "head",
          "props",
          "propsData",
          "asyncData",
          "data",
          "computed",
          "watch",
          "watchQuery",
          "ROUTER_GUARDS",
          "beforeCreate",
          "created",
          "beforeMount",
          "mounted",
          "beforeUpdate",
          "updated", // 声明周期重置
          "methods",
          [
            "template",
            "render"
          ],
          // "LIFECYCLE_HOOKS",           // 声明周期重置
          "beforeDestroy", // 声明周期重置
          "destroyed", // 声明周期重置
          "beforeUnmount", // 声明周期重置
          "unmounted", // 声明周期重置
          "renderError"
        ]
      }
    ],
    "vue/first-attribute-linebreak": 0,
    "vue/html-closing-bracket-newline": 0,
    "vue/attribute-hyphenation": 0,
    "vue/max-attributes-per-line": ["error", {
      "singleline": {
        "max": 50
      },
      "multiline": {
        "max": 200
      }
    }],
    "vue/html-indent": ["error", 2, {
      "attribute": 1,
      "baseIndent": 1,
      "closeBracket": 0,
      "alignAttributesVertically": false,
      "ignores": []
    }],
    "vue/singleline-html-element-content-newline": ["error", {
      "ignoreWhenNoAttributes": false,
      "ignoreWhenEmpty": true,
      "ignores": ['el-button', 'div', 'textOverflow', 'pre', 'textarea', ...INLINE_ELEMENTS]
    }],
    "vue/multiline-html-element-content-newline": ["error", {
      "ignoreWhenEmpty": true,
      "allowEmptyLines": true
    }]
    // "vue/mustache-interpolation-spacing":[]
  }
}
