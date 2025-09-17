import { defineStore } from 'pinia'
import { store } from '@/store'
import * as DeviceApi from '@/api/device.js'

export const useDeviceStore = defineStore('device', {
  state: () => {
    return {
      deviceTypeList: []
    }
  },
  getters: {},
  actions: {
    async getDeviceTypeList() {
      const resData = await DeviceApi.getDeviceTypeList()
      this.deviceTypeList = resData
    }
  },
  persist: true
})

export const useDeviceStoreWithOut = () => {
  return useDeviceStore(store)
}
