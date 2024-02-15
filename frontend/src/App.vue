<link rel="stylesheet" href="assets/main.css">
<script setup>
    import { RouterView } from 'vue-router'
    import PageHeader from './components/PageHeader.vue'
    import { NConfigProvider } from 'naive-ui'

    const themeOverrides = {
        common: {
            primaryColor: '#002FA7',
            primaryColorHover: "#002FA7"
        }
    }
</script>

<template>
    <n-config-provider :theme-overrides="themeOverrides">
     <!-- 注释，单行或多行 -->
        <header>
<!--          这个pageheader只是zmiccloud那个开头-->
            <PageHeader />
        </header>
<!--        这个routerview才是主体部分-->
        <RouterView />
    </n-config-provider>
</template>
