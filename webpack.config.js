const path = require('path')
// webstorm不识别@处理
module.exports = {
    context: path.resolve(__dirname, './'),
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@/': path.resolve('src'),
        }
    }
}