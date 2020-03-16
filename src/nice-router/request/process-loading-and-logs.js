import Taro from '@tarojs/taro'
import { LoadingType } from '@/nice-router/nice-router-util'
import OverlayLoading from '@/nice-router/overlay-loading'
import ViewMappingService from '@/nice-router/viewmapping.service'
import GlobalToast from '@/nice-router/global-toast'
import isEmpty from 'lodash/isEmpty'

const systemErrorXClass = 'com.terapico.caf.local.NetworkException'

function showLoading(loading) {
  if (loading === LoadingType.modal) {
    OverlayLoading.hideLoadingModal()
  }
  if (loading === LoadingType.barLoading) {
    Taro.hideNavigationBarLoading()
  }
}

async function hideLoading(loading) {
  if (loading === LoadingType.modal) {
    OverlayLoading.hideLoadingModal()
  }
  if (loading === LoadingType.barLoading) {
    Taro.hideNavigationBarLoading()
  }
}

function showError({ xclass, data = {} }) {
  console.error('request got error', data)

  // 系统错误，根据xclass跳转页面
  if (xclass === systemErrorXClass || ViewMappingService.getView(xclass)) {
    return
  }

  const { localizedMessage, messageList = [], message } = data

  const text = localizedMessage || message || messageList.map((msg) => msg.body).join('\n')
  if (!isEmpty(text)) {
    GlobalToast.show({ text, duration: 5000 })
  }
  // 开发环境，如果没有配置 本地错误，
  if (process.env.NODE_ENV === 'development') {
    GlobalToast.show({ text: `开发环境：错误信息:${JSON.stringify(data)}`, duration: 5000 })
  }
}

const processLoadingAndLogs = (chain) => {
  const { requestParams } = chain
  const { loading } = requestParams
  showLoading(loading)

  return chain.proceed(requestParams).then(async (resp) => {
    const { success, headers = {}, data } = resp
    await hideLoading(loading)

    if (!success) {
      showError(resp)
    }
    console.log('%c****************************', 'color:#40aad8')
    console.log('%c*  request Option:', 'color:#40aad8', requestParams)
    console.log('')
    console.log('%c*  X-Class:', 'color:#40aad8', headers['x-class'])
    console.log('%c*  X-Env-Type:', 'color:#40aad8', headers['x-env-type'])
    console.log('%c*  JSON Data:', 'color:#40aad8', data)
    console.log('%c****************************', 'color:#40aad8')
    return resp
  })
}

export default processLoadingAndLogs
