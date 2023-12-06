<template>
  <el-menu>
    <el-submenu v-for="(level1,i) in routes" :key="i" :index="level1.path">
      <template slot="title">
        {{level1.meta.title}}
      </template>
      <el-menu-item v-for="(level2,i) in level1.children" :key="i" :index="level2.path">
        <router-link :to="level2.path" tag="span">
          {{level2.meta.title}}
        </router-link>
        </el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
import routes from '@/router/routes'
export default {
  name: 'sidebar',
  components: {

  },
  props: {

  },
  data() {
    return {
      routes
    }
  },
  created() {
    console.log(routes)
  },
  methods: {

  }
}
</script>

<style scoped lang="scsss">
</style>
