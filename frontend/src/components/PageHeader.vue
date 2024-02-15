<script setup>
    import { 
        NPageHeader, 
        NAvatar, 
        NDivider,
        NSpace,
        NButton
    } from 'naive-ui';
    import { useRouter } from 'vue-router';
    const router = useRouter()
    function redirect_to_index() {router.push('/')}
    function redirect_to_about() {router.push('/about')}
</script>

<template>
    <n-page-header>
        <template #title>
            <h1>ZMICloud</h1>
        </template>
        <template #extra>
            <n-space>
                <n-button @click="redirect_to_index">Index</n-button>
                <n-button @click="redirect_to_about">About</n-button>
            </n-space>
        </template>
        <template #avatar>
<!--            <n-avatar :style="{backgroundColor: 'white'}" size="large" src="../images/fudan_logo.svg"/>-->
            <n-avatar :style="{backgroundColor: 'white'}" size="large" src="/images/fudan_logo.svg"/>
        </template>
    <n-divider />
    </n-page-header>
</template>
