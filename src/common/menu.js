import { isUrl } from '../utils/utils';

const menuData = [
  {

    name:'数据总览',
    icon:'home',
    path:'dashboard',
  },
  {
    name:'基础信息管理',
    icon:'idcard',
    path:'basicinfo',
    children:[
      {
        icon:'area-chart',
        name:'分公司管理',
        path:'subsidiary',
      },
      {
        icon:'bar-chart',
        name:'司机管理',
        path:'driver',
      },
      {
        icon:'solution',
        name:'账号管理',
        path:'account',
      },
    ]
  },
  {
    name:'订单管理',
    icon:'shop',
    path:'order',
    children:[
      {
        icon:'exception',
        name:'加油订单列表',
        path:'orderlist',
      }
    ]
  },
  {
    name:'油费管理',
    icon:'barcode',
    path:'oilfee',
    children:[
      {
        name:'账户管理',
        icon:'aliwangwang-o',
        path:'account',
        children:[
          {
            icon:'area-chart',
            name:'总账户',
            path:'general',
          },
          {
            icon:'bar-chart',
            name:'分公司账户',
            path:'branch',
          },
          {
            icon:'setting',
            name:'司机账户',
            path:'driver',
          }
        ]
      },
      {
        name:'油费发放',
        icon:'shop',
        path:'provide',
      },
      // {
      //   name:'联名卡管理',
      //   icon:'aliwangwang-o',
      //   path:'cocard',
      //   children:[
      //     {
      //       icon:'area-chart',
      //       name:'补贴计划',
      //       path:'plan',
      //     },
      //     {
      //       icon:'bar-chart',
      //       name:'联名卡订单',
      //       path:'order',
      //     },
      //   ]
      // },
    ]
  },
  {
    name:'结算管理',
    icon:'wallet',
    path:'settlement',
    children:[
      {
        name:'对账单',
        icon:'aliwangwang-o',
        path:'statement',
        children:[
          {
            icon:'area-chart',
            name:'预存账单',
            path:'prestore',
          },
          {
            icon:'bar-chart',
            name:'授信账单',
            path:'credit',
          },
          // {
          //   icon:'setting',
          //   name:'联名卡账单',
          //   path:'cocard',
          // }
        ]
      },
    ]
  },
  // {
  //   name:'数据报表',
  //   icon:'barcode',
  //   path:'report',
  //   children:[
  //     {
  //       name:'加油日报表',
  //       icon:'aliwangwang-o',
  //       path:'day',
  //     },      
  //     {
  //       name:'加油月报表',
  //       icon:'aliwangwang-o',
  //       path:'month',
  //     },
  //   ]
  // },
  // {
  //   name: 'dashboard',
  //   icon: 'dashboard',
  //   path: 'dashboard',
  //   children: [
  //     {
  //       name: '分析页',
  //       path: 'analysis',
  //     },
  //     {
  //       name: '监控页',
  //       path: 'monitor',
  //     },
  //     {
  //       name: '工作台',
  //       path: 'workplace',
  //       // hideInBreadcrumb: true,
  //       // hideInMenu: true,
  //     },
  //     {
  //       name: '测试页',
  //       path: 'test',
  //     },
  //   ],
  // },
  // {
  //   name: '表单页',
  //   icon: 'form',
  //   path: 'form',
  //   children: [
  //     {
  //       name: '基础表单',
  //       path: 'basic-form',
  //     },
  //     {
  //       name: '分步表单',
  //       path: 'step-form',
  //     },
  //     {
  //       name: '高级表单',
  //       authority: 'admin',
  //       path: 'advanced-form',
  //     },
  //   ],
  // },
  // {
  //   name: '列表页',
  //   icon: 'table',
  //   path: 'list',
  //   children: [
  //     {
  //       name: '查询表格',
  //       path: 'table-list',
  //     },
  //     {
  //       name: '标准列表',
  //       path: 'basic-list',
  //     },
  //     {
  //       name: '卡片列表',
  //       path: 'card-list',
  //     },
  //     {
  //       name: '搜索列表',
  //       path: 'search',
  //       children: [
  //         {
  //           name: '搜索列表（文章）',
  //           path: 'articles',
  //         },
  //         {
  //           name: '搜索列表（项目）',
  //           path: 'projects',
  //         },
  //         {
  //           name: '搜索列表（应用）',
  //           path: 'applications',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   name: '详情页',
  //   icon: 'profile',
  //   path: 'profile',
  //   children: [
  //     {
  //       name: '基础详情页',
  //       path: 'basic',
  //     },
  //     {
  //       name: '高级详情页',
  //       path: 'advanced',
  //       authority: 'admin',
  //     },
  //   ],
  // },
  // {
  //   name: '结果页',
  //   icon: 'check-circle-o',
  //   path: 'result',
  //   children: [
  //     {
  //       name: '成功',
  //       path: 'success',
  //     },
  //     {
  //       name: '失败',
  //       path: 'fail',
  //     },
  //   ],
  // },
  // {
  //   name: '异常页',
  //   icon: 'warning',
  //   path: 'exception',
  //   children: [
  //     {
  //       name: '403',
  //       path: '403',
  //     },
  //     {
  //       name: '404',
  //       path: '404',
  //     },
  //     {
  //       name: '500',
  //       path: '500',
  //     },
  //     {
  //       name: '触发异常',
  //       path: 'trigger',
  //       hideInMenu: true,
  //     },
  //   ],
  // },
  // {
  //   name: '账户',
  //   icon: 'user',
  //   path: 'user',
  //   authority: 'guest',
  //   children: [
  //     {
  //       name: '登录',
  //       path: 'login',
  //     },
  //     {
  //       name: '注册',
  //       path: 'register',
  //     },
  //     {
  //       name: '注册结果',
  //       path: 'register-result',
  //     },
  //   ],
  // },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
