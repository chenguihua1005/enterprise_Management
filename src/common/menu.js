import { isUrl } from '../utils/utils';

const menuData = [
  {
    name:'数据总览',
    icon:'home',
    path:'dashboard',
    amUrl:"/dashboard",
    // authority:"noAuthority"
  },
  {
    name:'基础信息管理',
    icon:'idcard',
    path:'basicinfo',
    amUrl:"/basicinfo",
    children:[
      {
        icon:'desktop',
        name:'分公司管理',
        path:'subsidiary',
        // authority: "noAuthority",
        amUrl:"/basicinfo/subsidiary"
      },
      {
        icon:'team',
        name:'司机管理',
        path:'driver',
        // authority: "noAuthority",
        amUrl:"/basicinfo/driver"
      },
      {
        icon:'lock',
        name:'账号管理',
        path:'accountadmin',
        amUrl:"/basicinfo/accountadmin",
        children:[
          {
            icon:'user',
            name:'角色管理',
            // authority: "noAuthority",
            path:'role',
            amUrl:"/basicinfo/accountadmin/role"
          },
          {
            icon:'idcard',
            name:'用户管理',
            // authority: "noAuthority",
            path:'account',
            amUrl:"/basicinfo/accountadmin/account"
          }
        ]
      },
    ]
  },
  {
    name:'订单管理',
    icon:'shop',
    path:'order',
    amUrl:"/order",
    children:[
      {
        icon:'exception',
        name:'加油订单列表',
        path:'orderlist',
        // authority: "noAuthority",
        amUrl:"/order/orderlist"
      }
    ]
  },
  {
    name:'油费管理',
    icon:'barcode',
    path:'oilfee',
    amUrl:"/oilfee",
    children:[
      {
        name:'账户管理',
        icon:'aliwangwang-o',
        path:'oilaccount',
        amUrl:"/oilfee/oilaccount",
        children:[
          {
            icon:'area-chart',
            name:'总账户',
            path:'general',
            // authority: "noAuthority",
            amUrl:"/oilfee/oilaccount/general"
          },
          {
            icon:'bar-chart',
            name:'分公司账户',
            path:'branch',
            // authority: "noAuthority",
            amUrl:"/oilfee/oilaccount/branch"
          },
          {
            icon:'setting',
            name:'司机账户',
            path:'driveraccout',
            // authority: "noAuthority",
            amUrl:"/oilfee/oilaccount/driveraccout"
          }
        ]
      },
      {
        name:'油费发放',
        icon:'shop',
        path:'provide',
        // authority: "noAuthority",
        amUrl:"/oilfee/provide"
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
    amUrl:"/settlement",
    children:[
      {
        name:'对账单',
        icon:'aliwangwang-o',
        path:'statement',
        amUrl:"/settlement/statement",
        children:[
          {
            icon:'area-chart',
            name:'预存账单',
            path:'prestore',
            amUrl:"/settlement/statement/prestore",
          },
          {
            icon:'bar-chart',
            name:'授信账单',
            path:'credit',
            amUrl:"/settlement/statement/credit",
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
];

function clearAuthority(data){
  return data.map(item => {
    if (item.hasOwnProperty("authority")) {
      delete item["authority"];
    }
    const result = {
      ...item,
    };
    if (item.children) {
      result.children =clearAuthority(item.children);
    }
    return result;
  });
}

function formatterMenuData(MenuData) {
  // const msg=window.localStorage.getItem('currentAuthority');
  const clearMenuData=clearAuthority(MenuData);
  // console.log('clear', clearMenuData);
  const arr = JSON.parse(window.localStorage.getItem('loginRole'));
  // console.log('arr', arr);
  if (Array.isArray(arr) && arr.length > 0) {
    arr.forEach((item) => {
      renderMenuItem(clearMenuData, item.amUrl);
    })
  }
  return clearMenuData;
}
//递归菜单树形结构
function renderMenuItem(data, key) {
  for(var i in data) {
    if(data[i]["amUrl"]==key) {
      // 如果url相等 就设置 没有权限
      data[i]["authority"] = 'noAuthority';
      break;
    } else {
      renderMenuItem(data[i].children, key);
    }
  }
}

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
// console.log('MenuData',formatterMenuData(menuData));  //给没有权限的节点设置权限
//根节点的权限不能动，没有权限的模块设置一下就可以了
// console.log('MenuData11',menuData);
export const getMenuData = () => formatter(formatterMenuData(menuData));
