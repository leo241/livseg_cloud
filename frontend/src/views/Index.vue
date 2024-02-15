<script setup>
    import { NCard, NSpace } from 'naive-ui'
</script>

<template>

    <n-card style="max-width:1300px">

        <template #header>
            <h2>Framework </h2>
        </template>

        <n-space justify="space-between">

            <n-card size="small">
                <template #cover>
                    <img src="/images/steps/step1.png">
                </template>
                <template #header>
                    <h3>Hardware</h3>
                </template>
                Fast server and GPU devices
            </n-card>

            <n-card size="small">
                <template #cover>
                    <img src="/images/steps/step2.png">
                </template>
                <template #header>
                    <h3>Algorithm</h3>
                </template>
                Various algorithms for medical images
            </n-card>

            <n-card size="small">
                <template #cover>
                    <img src="/images/steps/step3.png">
                </template>
                <template #header>
                    <h3>Application</h3>
                </template>
                Multiple supported organs & diseases
            </n-card>

            <n-card size="small">
                <template #cover>
                    <img src="/images/steps/step4.png">
                </template>
                <template #header>
                    <h3>Build your own</h3>
                </template>
                Build your personal tools
            </n-card>

        </n-space>
    </n-card>

    <n-card style="max-width:1300px">

        <template #header>
            <h2>Gallery</h2>
        </template>

        <template #header-extra>
            <h5>Click items in gallery to get started</h5>
        </template>

        <n-space justify="space-between">

            <n-card size="small">
                <template #cover>
                    <a href="/cardiac_workflow"><img src="/images/heart.png"></a>
                </template>
                <template #header>
                    <a href="/cardiac_workflow">Cardiac Workflow</a>
                </template>
            </n-card>

          <n-card size="small">
            <template #cover>
              <a href="/livseg"><img src="/images/liver.jpg"></a>
            </template>
            <template #header>
              <a href="/livseg">LivSeg MRI</a>
            </template>
          </n-card>

        </n-space>
    </n-card>

</template>

<style scoped>
    .n-card {
        max-width: 300px;
        border-radius: 10px
    }
    a {
    font-size: 1.17rem;
    font-weight: bold;
    color: black;
    text-decoration: none;
  }
  a:hover {
    color: blue;
  }
</style>
