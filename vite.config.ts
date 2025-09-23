import { resolve } from 'path';
import { loadEnv } from 'vite';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import';
import type { UserConfig, ConfigEnv } from 'vite';
import { createVitePlugins } from './build/vite';
import { include, exclude } from './build/vite/optimize';
import cesium from 'vite-plugin-cesium';
// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd();

// 路径查找
function pathResolve(dir: string) {
    return resolve(root, '.', dir);
}

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
    let env = {} as any;
    const isBuild = command === 'build';
    if (!isBuild) {
        env = loadEnv(process.argv[3] === '--mode' ? process.argv[4] : process.argv[3], root);
    } else {
        env = loadEnv(mode, root);
    }
    return {
        base: env.VITE_BASE_PATH,
        root: root,
        // 服务端渲染
        server: {
            port: env.VITE_PORT, // 端口号
            host: '0.0.0.0',
            open: env.VITE_OPEN === 'true',
            // 本地跨域代理. 目前注释的原因：暂时没有用途，server 端已经支持跨域
            proxy: {
                ['/admin-api/dev']: {
                    target: 'http://10.222.127.235:8011/',
                    ws: false,
                    changeOrigin: true,
                    rewrite: (path) => {
                        const p = path.replace(new RegExp(`^/admin-api/dev`), '');
                        return p;
                    }
                },
                ['/admin-api']: {
                    target: 'http://10.222.125.229:48080/',
                    ws: false,
                    changeOrigin: true,
                    rewrite: (path) => {
                        const p = path.replace(
                            new RegExp(`^/admin-api`),
                            'http://10.222.125.229:48080/admin-api'
                        );
                        return p;
                    }
                }
            }
        },
        // 项目使用的vite插件。 单独提取到build/vite/plugin中管理
        plugins: [
            createVitePlugins(),
            cesium(),
            lazyImport({
                resolvers: [
                    VxeResolver({
                        libraryName: 'vxe-table'
                    }),
                    VxeResolver({
                        libraryName: 'vxe-pc-ui'
                    })
                ]
            })
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@import "./src/styles/variables.scss";',
                    javascriptEnabled: true
                }
            }
        },
        resolve: {
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
            alias: [
                {
                    find: 'vue-i18n',
                    replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
                },
                {
                    find: /\@\//,
                    replacement: `${pathResolve('src')}/`
                }
            ]
        },
        build: {
            minify: 'terser',
            outDir: env.VITE_OUT_DIR || 'dist',
            sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
            // brotliSize: false,
            terserOptions: {
                compress: {
                    drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
                    drop_console: env.VITE_DROP_CONSOLE === 'true'
                }
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        echarts: ['echarts'] // 将 echarts 单独打包，参考 https://gitee.com/yudaocode/yudao-ui-admin-vue3/issues/IAB1SX 讨论
                    }
                }
            }
        },
        optimizeDeps: { include, exclude }
    };
};
