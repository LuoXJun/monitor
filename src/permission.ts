import router from './router';
import type { RouteRecordRaw } from 'vue-router';
import { isRelogin } from '@/config/axios/service';
import { getAccessToken, removeToken } from '@/utils/auth';
import { useTitle } from '@/hooks/web/useTitle';
import { useNProgress } from '@/hooks/web/useNProgress';
import { usePageLoading } from '@/hooks/web/usePageLoading';
import { useUserStoreWithOut } from '@/store/modules/user';
import { usePermissionStoreWithOut } from '@/store/modules/permission';
import { useAppStore } from '@/store/modules/app';

const { start, done } = useNProgress();

const { loadStart, loadDone } = usePageLoading();

const parseURL = (
    url: string | null | undefined
): { basePath: string; paramsObject: { [key: string]: string } } => {
    // 如果输入为 null 或 undefined，返回空字符串和空对象
    if (url == null) {
        return { basePath: '', paramsObject: {} };
    }

    // 找到问号 (?) 的位置，它之前是基础路径，之后是查询参数
    const questionMarkIndex = url.indexOf('?');
    let basePath = url;
    const paramsObject: { [key: string]: string } = {};

    // 如果找到了问号，说明有查询参数
    if (questionMarkIndex !== -1) {
        // 获取 basePath
        basePath = url.substring(0, questionMarkIndex);

        // 从 URL 中获取查询字符串部分
        const queryString = url.substring(questionMarkIndex + 1);

        // 使用 URLSearchParams 遍历参数
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
            // 封装进 paramsObject 对象
            paramsObject[key] = value;
        });
    }

    // 返回 basePath 和 paramsObject
    return { basePath, paramsObject };
};

// 路由不重定向白名单
const whiteList = [
    '/login',
    '/social-login',
    '/auth-redirect',
    '/bind',
    '/register',
    '/oauthLogin/gitee',
    '/loginSso'
];

// 路由加载前
router.beforeEach(async (to, from, next) => {
    console.log(to);

    // 前往独立页时隐藏左侧菜单
    const appStore = useAppStore();
    if (to.matched && to.matched.length > 0) {
        const name = to.matched[0].name?.toString();
        if (name?.includes('Parent')) appStore.singleRoute = true;
        else appStore.singleRoute = false;
    } else appStore.singleRoute = true;

    start();
    loadStart();
    if (getAccessToken()) {
        console.log('已登录', to.path);

        // 获取所有字典
        const userStore = useUserStoreWithOut();
        const permissionStore = usePermissionStoreWithOut();

        if (!userStore.getIsSetUser) {
            isRelogin.show = true;
            await userStore.setUserInfoAction();
            isRelogin.show = false;
            // 后端过滤菜单
            await permissionStore.generateRoutes();
            permissionStore.getAddRouters.forEach((route) => {
                router.addRoute(route as unknown as RouteRecordRaw); // 动态添加可访问路由表
            });
            const redirectPath = from.query.redirect || to.path;
            // 修复跳转时不带参数的问题
            const redirect = decodeURIComponent(redirectPath as string);
            const { paramsObject: query } = parseURL(redirect);
            const nextData =
                to.path === redirect ? { ...to, replace: true } : { path: redirect, query };
            next(nextData);
        } else {
            next();
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next();
        } else {
            //next(`/login?redirect=${encodeURIComponent(to.fullPath)}`) // 否则全部重定向到登录页
            //next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
            // window.location.href = 'http://58.42.81.57:45635/login'//开发门户
            window.location.href = localStorage.getItem('loginurl')
                ? (localStorage.getItem('loginurl') as string)
                : `${import.meta.env.VITE_MENHU_URL}/login`; //开发门户
            //window.location.href = 'http://10.222.125.229:18556/login'//测试门户
        }
    }
});

router.afterEach((to) => {
    useTitle(to?.meta?.title as string);
    done(); // 结束Progress
    loadDone();
});
