<template>
  <div class="base-info">
    <div>
      <p style="width: 20px;height: 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path
fill="rgb(0, 82, 217)"
            d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z" />
        </svg>
      </p>

      <span>基本信息</span>
    </div>
    <div>
      <p v-for="i in 10" :key="i">
        <span>标题:</span>
        <span>内容内容内容内容内容</span>
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">

defineProps({
  data: {
    type: Object,
    default: () => { }
  }
})

</script>

<style lang="scss">
.base-info {
  padding: 6px;
  background: rgba(239, 243, 255, 1);

  >div:first-child {
    padding: 4px 10px;
    display: flex;
    align-items: center;

    >span {
      margin-left: 5px;
    }
  }

  >div:nth-child(2) {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
    box-sizing: border-box;

    >p {
      flex: 25% 0 0;
      display: flex;
      align-items: center;
      font-size: 14px;
      padding: 5px 20px;

      >span:first-child {
        flex: 25% 0 0;
        color: #c6c6c6;
      }

      >span:nth-child(2) {
        flex: 1 0 0;
      }
    }
  }
}
</style>
