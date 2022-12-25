import request from '@/utils/request'

const apiPath = '/sys/schedule'

/**
 * 获得列表数据
 * @returns {Promise<*>}
 */
export function page(data) {
    return request({
        url: `${apiPath}/page`,
        method: 'get',
        params: data
    })
}

/**
 * 新增或者編輯
 * @param data
 * @returns {*}
 */
export function saveAndUpdate(data) {
    let method = data.id ? 'put' : 'post'
    return request({
        url: `${apiPath}`,
        method: method,
        data: data
    })
}


/**
 * 立即执行任务
 * @param data
 * @returns {Promise<*>}
 */
export async function runTask(data) {
    return request({
        url: `${apiPath}/run`,
        method: 'post',
        data: data
    })
}

/**
 * 暂停定时任务
 * @param data
 * @returns {Promise<*>}
 */
export async function pause(data) {
    return request({
        url: `${apiPath}/pause`,
        method: 'post',
        data: data
    })
}

/**
 * 恢复定时任务
 * @param data
 * @returns {Promise<*>}
 */
export async function resume(data) {
    return request({
        url: `${apiPath}/resume`,
        method: 'post',
        data: data
    })
}


/**
 * 获得信息
 * @param id
 * @returns {*}
 */
export function detail(id) {
    return request({
        url: `${apiPath}/detail/${id}`,
        method: 'get',
    })
}

/**
 * 删除
 * @param data
 * @returns {*}
 */
export function remove(data) {
    return request({
        url: `${apiPath}`,
        method: 'delete',
        data: data
    })
}


/**
 * 日志分页
 * @param data
 * @returns {Promise<*>}
 */
export function logPage(data) {
    return request({
        url: `/sys/scheduleLog/page`,
        method: 'get',
        params: data
    })
}


/**
 * 删除
 * @param data
 * @returns {*}
 */
export function logRemove(data) {
    return request({
        url: `/sys/scheduleLog`,
        method: 'delete',
        data: data
    })
}


/**
 * 清空
 * @param type
 * @returns {*}
 */
export function logClear() {
    return request({
        url: `/sys/scheduleLog/clear`,
        method: 'delete',
    })
}