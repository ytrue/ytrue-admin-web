import request from '@/utils/request'

const apiPath = '/sys/dept'

/**
 * 获得列表数据
 * @returns {Promise<*>}
 */
export function page(data) {
    return request({
        url: `${apiPath}/page`,
        method: 'post',
        data: data
    })
}


/**
 * 获得列表数据
 * @returns {Promise<*>}
 */
export function list(data) {
    return request({
        url: `${apiPath}/list`,
        method: 'post',
        data: data
    })
}


/**
 * 新增或者編輯
 * @param data
 * @returns {*}
 */
export function saveAndUpdate(data) {
    let method = params.userId ? 'put' : 'post'
    return request({
        url: `${apiPath}/page`,
        method: method,
        data: data
    })
}


/**
 * 获得信息
 * @param id
 * @returns {*}
 */
export function info(id) {
    return request({
        url: `${apiPath}/${id}/info`,
        method: 'get',
    })
}

/**
 * 删除
 * @param data
 * @returns {*}
 */
export function remove(data) {
    return request(apiPath, 'delete', data)
}