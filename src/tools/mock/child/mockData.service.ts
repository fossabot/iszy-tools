import type { MockData, MockPrj, ResultDto } from './mock'
import dayjs from 'dayjs'
import ElMessage from 'element-plus/es/components/message/index'
import config from '@/config'
import { API } from '@/plugins/API'
import { deleteParam, setParam } from '@/utils/hashHandler'

const emptyMockData: MockData = {
  id: -1,
  name: '',
  type: 'all',
  enabled: true,
  path: '',
  description: '',
  delay: 0,
  contentType: '',
  response: '',
  projectId: '',
}

export const selectedProject = ref<MockPrj>()
export const mockData = ref<MockData[]>([])

export function getNewMockData() {
  if (!selectedProject.value) {
    throw new Error('未选择项目')
  }
  return {
    ...emptyMockData,
    projectId: selectedProject.value.id,
  }
}

export async function setProject(prj?: MockPrj) {
  selectedProject.value = prj
  mockData.value = []
  if (selectedProject.value) {
    setParam('prjId', selectedProject.value.id)
    await refreshMockData()
  }
  else {
    deleteParam('prjId')
  }
}

export async function editData(data: MockData) {
  try {
    const res: ResultDto<never> = await API.put(`/mock/api/data/${data.id}`, {
      ...data,
      id: undefined,
      projectId: undefined,
    })
    if (res.success) {
      ElMessage.success('修改数据成功')
      refreshMockData().then()
      return true
    }
    else {
      ElMessage.error('修改数据失败')
    }
  }
  catch (e) {
    ElMessage.error('修改数据失败')
  }
  return false
}

export async function createData(data: MockData) {
  try {
    const res: ResultDto<never> = await API.post(`/mock/api/data`, { ...data, id: undefined, projectId: selectedProject.value?.id })
    if (res.success) {
      ElMessage.success('创建数据成功')
      refreshMockData().then()
      return true
    }
    else {
      ElMessage.error('创建数据失败')
    }
  }
  catch (e) {
    ElMessage.error('创建数据失败')
  }
  return false
}

export async function deleteData(data: MockData) {
  try {
    const res: ResultDto<never> = await API.delete(`/mock/api/data/${data.id}`)
    if (res.success) {
      ElMessage.success('删除数据成功')
      refreshMockData().then()
      return true
    }
    else {
      ElMessage.error('删除数据失败')
    }
  }
  catch (e) {
    ElMessage.error('删除数据失败')
  }
  return false
}

async function refreshMockData() {
  if (!selectedProject.value) {
    ElMessage.error('未选择项目')
    return
  }
  try {
    mockData.value = await getMockData(selectedProject.value)
  }
  catch (e) {
    console.log(e)
    ElMessage.error('获取数据列表失败')
  }
}

// 获取接口列表
async function getMockData(prj: MockPrj) {
  const data: ResultDto<MockData[]> = await API.get(`/mock/api/prj/${prj.id}/list`)
  if (data.success) {
    return (data.data || []).map((item) => {
      item.createdAt = dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')
      item.url = `${config.apiBaseUrl}/mock/${prj.id}${prj.path}${item.path}`
      return item
    })
  }
  else {
    throw new Error(data.message)
  }
}
