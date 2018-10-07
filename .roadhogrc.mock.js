import mockjs from 'mockjs';
import { getRule, postRule } from './mock/rule';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getFakeChartData } from './mock/chart';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
import { format, delay } from 'roadhog-api-doc';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  // 'GET /(.*)':' http://192.168.92.52:55000/',
  // 'POST /(.*)': ' http://192.168.92.52:55000/',

  // 支持值为 Object 和 Array
  // 'GET /api/currentUser': {
  //   $desc: '获取当前用户接口',
  //   $params: {
  //     pageSize: {
  //       desc: '分页',
  //       exp: 2,
  //     },
  //   },
  //   $body: {
  //     name: 'admin',
  //     avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  //     userid: '00000001',
  //     notifyCount: 12,
  //   },
  // },
  // // GET POST 可省略
  // 'GET /api/users': [
  //   {
  //     key: '1',
  //     name: 'John Brown',
  //     age: 32,
  //     address: 'New York No. 1 Lake Park',
  //   },
  //   {
  //     key: '2',
  //     name: 'Jim Green',
  //     age: 42,
  //     address: 'London No. 1 Lake Park',
  //   },
  //   {
  //     key: '3',
  //     name: 'Joe Black',
  //     age: 32,
  //     address: 'Sidney No. 1 Lake Park',
  //   },
  // ],
  // 'GET /api/project/notice': getNotice,
  // 'GET /api/activities': getActivities,
  // 'GET /api/rule': getRule,
  // 'POST /api/rule': {
  //   $params: {
  //     pageSize: {
  //       desc: '分页',
  //       exp: 2,
  //     },
  //   },
  //   $body: postRule,
  // },
  // //2018-8-28,
  // 'GET /api/basicinfo1': getTableData1,
  // 'GET /api/basicinfo2': getTableData2,
  // 'GET /api/basicinfo3': getTableData3,
  // 'GET /api/queryOrder': getOrderData,
  // 'GET /api/fake_dashboard_data': getFakeDashboardData,
  // 'GET /api/statement1': getStatementData1,
  // 'GET /api/statement2': getStatementData2,

  // 'POST /api/forms': (req, res) => {
  //   res.send({ message: 'Ok' });
  // },
  // 'GET /api/tags': mockjs.mock({
  //   'list|100': [{ name: '@city', 'value|1-100': 150, 'type|0-2': 1 }],
  // }),
  // 'GET /api/fake_list': getFakeList,
  // 'GET /api/fake_chart_data': getFakeChartData,
  // 'GET /api/profile/basic': getProfileBasicData,
  // 'GET /api/profile/advanced': getProfileAdvancedData,

  // 'POST /api/login/account': (req, res) => {
  //   const { password, userName, type } = req.body;
  //   if (password === '888888' && userName === 'admin') {
  //     res.send({
  //       status: 'ok',
  //       type,
  //       currentAuthority: 'admin',
  //     });
  //     return;
  //   }
  //   if (password === '123456' && userName === 'user') {
  //     res.send({
  //       status: 'ok',
  //       type,
  //       currentAuthority: 'user',
  //     });
  //     return;
  //   }
  //   res.send({
  //     status: 'error',
  //     type,
  //     currentAuthority: 'guest',
  //   });
  // },
  // 'POST /api/register': (req, res) => {
  //   res.send({ status: 'ok', currentAuthority: 'user' });
  // },
  // 'GET /api/notices': getNotices,
  // 'GET /api/500': (req, res) => {
  //   res.status(500).send({
  //     timestamp: 1513932555104,
  //     status: 500,
  //     error: 'error',
  //     message: 'error',
  //     path: '/base/category/list',
  //   });
  // },
  // 'GET /api/404': (req, res) => {
  //   res.status(404).send({
  //     timestamp: 1513932643431,
  //     status: 404,
  //     error: 'Not Found',
  //     message: 'No message available',
  //     path: '/base/category/list/2121212',
  //   });
  // },
  // 'GET /api/403': (req, res) => {
  //   res.status(403).send({
  //     timestamp: 1513932555104,
  //     status: 403,
  //     error: 'Unauthorized',
  //     message: 'Unauthorized',
  //     path: '/base/category/list',
  //   });
  // },
  // 'GET /api/401': (req, res) => {
  //   res.status(401).send({
  //     timestamp: 1513932555104,
  //     status: 401,
  //     error: 'Unauthorized',
  //     message: 'Unauthorized',
  //     path: '/base/category/list',
  //   });
  // },
};

export default (noProxy ? {
  // 'GET /(.*)':'http://www.api.com/',
  // 'POST /(.*)': 'http://www.api.com/',

  //孙靖宇测试环境
  // 'GET /(.*)': 'http://192.168.92.52:55000/',
  // 'POST /(.*)': 'http://192.168.92.52:55000/',

  //测试环境token环境
  'GET /(.*)': 'http://test.api-bms.51zhaoyou.com/bms/',
  'POST /(.*)': 'http://test.api-bms.51zhaoyou.com/bms/',

  //冯宇测试环境
  // 'GET /(.*)':'192.168.91.54:1551/',
  // 'POST /(.*)': '192.168.91.54:1551/',
  // 'GET /(.*)':'192.168.91.53:19953/',
  // 'POST /(.*)': '192.168.91.53:19953/',
} : delay(proxy, 1000));
