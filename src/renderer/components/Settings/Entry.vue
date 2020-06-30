<template>
  <div class="settings-entry">
    <div style="width: 250px"><slot name="description"></slot></div>
    <div style="float: right;">
      <el-switch
        v-if="type === 'switch'"
        v-model="_value"
        active-color="#13ce66"
        inactive-color="#ff4949"
      ></el-switch>
      <el-input
        v-else-if="type === 'text'"
        v-model="_value"
        type="text"
        size="small"
        :style="{ width }"
      ></el-input>
      <el-input
        v-else-if="type === 'textarea'"
        v-model="_value"
        type="textarea"
        resize="none"
        :rows="rows"
        :style="{ width }"
      ></el-input>
      <el-button
        v-else-if="type === 'button'"
        @click="e => $emit('click', e)"
        :type="buttonType"
        size="small"
      ><slot name="button-text"></slot></el-button>
      <el-input-number
        v-else-if="type === 'number'"
        v-model="_value"
        :min="min"
        :max="max"
        :controls="false"
        :style="{ width }"
      ></el-input-number>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Entry',
    props: {
      type: {
        type: String,
        required: true,
        validator: function (value) {
          return ['switch', 'text', 'textarea', 'button', 'number'].indexOf(value) !== -1
        }
      },
      width: {
        type: String,
        default: '200px'
      },
      rows: {
        type: Number,
        default: 5
      },
      buttonType: {
        type: String,
        default: 'primary'
      },
      value: [Object, String, Boolean, Number, Array],
      min: Number,
      max: Number
    },
    computed: {
      _value: {
        get () {
          return this.value
        },
        set (val) {
          this.$emit('input', val)
        }
      }
    }
  }
</script>

<style scoped>
  .settings-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
  }
</style>
