// babel.config.js for jest to test typecript
// 该babel配置文件为jest测试Typescript服务
module.exports = {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
}
