import React, { createElement } from 'react';
import { Spin } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      // eslint-disable-next-line
      app.model(require(`../models/${model}`).default);
    }
  });

  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      return createElement(component().default, {
        ...props,
        routerData: getRouterData(app),
      });
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      // return createElement(component().default, {
      //   ...props,
      //   routerData: routerDataCache,
      // });
    };
  }
  // () => import('module')
  return Loadable({
    loader: () => {
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: getRouterData(app),
          });
      });
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      // return component().then(raw => {
      //   const Component = raw.default || raw;
      //   return props =>
      //     createElement(Component, {
      //       ...props,
      //       routerData: routerDataCache,
      //     });
      // });
    },
    loading: () => {
      return <Spin size="large" className="global-spin" />;
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    //首页
    '/dashboard': {
      component: dynamicWrapper(app, ['dashboard'], () => import('../routes/Dashboard/Dashboard')),
    },
    //基础信息管理
    '/basicinfo/subsidiary': {
      //分公司管理
      component: dynamicWrapper(app, ['basicinfo'], () => import('../routes/Basicinfo/Subsidiary')),
    },
    '/basicinfo/driver': {
      //司机管理
      component: dynamicWrapper(app, ['basicinfo'], () => import('../routes/Basicinfo/Driver')),
    },
    //角色管理
    '/basicinfo/accountadmin/role': {
      component: dynamicWrapper(app, ['basicinfo'], () => import('../routes/Basicinfo/Role')),
    },
    //用户管理
    '/basicinfo/accountadmin/account': {
      component: dynamicWrapper(app, ['basicinfo'], () => import('../routes/Basicinfo/Account')),
    },
     //加油订单管理
     '/order/orderList': {
      component: dynamicWrapper(app, ['order'], () => import('../routes/Order/OrderList')),
    },
    // 油费管理-账户管理-总账户
    '/oilfee/oilaccount/general': {
      component: dynamicWrapper(app, ['oilfee'], () => import('../routes/OilFee/Account/General')),
    },
    // 油费管理-账户管理-分公司账户
    '/oilfee/oilaccount/branch': {
      component: dynamicWrapper(app, ['oilfee'], () => import('../routes/OilFee/Account/Branch')),
    },
    // 油费管理-账户管理-司机账户
    '/oilfee/oilaccount/driveraccout': {
      component: dynamicWrapper(app, ['oilfee'], () => import('../routes/OilFee/Account/Driver')),
    },
    // 油费管理-油费发放
    '/oilfee/provide': {
      component: dynamicWrapper(app, ['oilfee'], () => import('../routes/OilFee/Provide')),
    },
    //对账单-预存账单
    '/settlement/statement/prestore': {
      component: dynamicWrapper(app, ['statement'], () =>
        import('../routes/Settlement/Statement/Prestore')
      ),
    },
    //对账单-授信账单
    '/settlement/statement/credit': {
      component: dynamicWrapper(app, ['statement'], () =>
        import('../routes/Settlement/Statement/Credit')
      ),
    },
     //加油日报表
     '/sheet/dailysheet': {
      component: dynamicWrapper(app, ['sheet'], () => import('../routes/Sheet/DailySheet')),
    },
      //加油月报表
      '/sheet/monthlysheet': {
        component: dynamicWrapper(app, ['sheet'], () => import('../routes/Sheet/MonthlySheet')),
      },

    // '/dashboard/analysis': {
    //   component: dynamicWrapper(app, ['chart'], () => import('../routes/Dashboard/Analysis')),
    // },
    // '/dashboard/monitor': {
    //   component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
    // },
    // '/dashboard/workplace': {
    //   component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
    //     import('../routes/Dashboard/Workplace')
    //   ),
    //   // hideInBreadcrumb: true,
    //   // name: '工作台',
    //   // authority: 'admin',
    // },
    // '/form/basic-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/BasicForm')),
    // },
    // '/form/step-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm')),
    // },
    // '/form/step-form/info': {
    //   name: '分步表单（填写转账信息）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step1')),
    // },
    // '/form/step-form/confirm': {
    //   name: '分步表单（确认转账信息）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step2')),
    // },
    // '/form/step-form/result': {
    //   name: '分步表单（完成）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step3')),
    // },
    // '/form/advanced-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/AdvancedForm')),
    // },
    // '/list/table-list': {
    //   component: dynamicWrapper(app, ['rule'], () => import('../routes/List/TableList')),
    // },
    // '/list/basic-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/BasicList')),
    // },
    // '/list/card-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/CardList')),
    // },
    // '/list/search': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/List')),
    // },
    // '/list/search/projects': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Projects')),
    // },
    // '/list/search/applications': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Applications')),
    // },
    // '/list/search/articles': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Articles')),
    // },
    // '/profile/basic': {
    //   component: dynamicWrapper(app, ['profile'], () => import('../routes/Profile/BasicProfile')),
    // },
    // '/profile/advanced': {
    //   component: dynamicWrapper(app, ['profile'], () =>
    //     import('../routes/Profile/AdvancedProfile')
    //   ),
    // },
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
