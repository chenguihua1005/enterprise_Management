import { stringify } from 'qs';
import request from '../utils/request';
// const baseUrl=""
//测试环境
export const baseUrl="http://test.api-bms.51zhaoyou.com/bms/";
//生产环境
// export const baseUrl = 'https://api-bms.51zhaoyou.com/bms/';


//------------0公共接口---------------
//登录，请求token
export async function queryAccountLogin(params) {
  return request(baseUrl + 'login/getAccessToken', {
    method: 'POST',
    body: params,
  });
}
// 获取验证码
export async function queryGetVerifyImg(params) {
  return request(baseUrl + 'login/getVerifyImg/', {
    method: 'POST',
    body: params,
  });
}

//获取各个模块下拉框
export async function queryBasicinfoValid(params) {
  return request(baseUrl + 'common/getSelectList', {
    method: 'POST',
    body: params,
  });
}

//用户修改密码
export async function queryUpdatePassword(params) {
  return request(baseUrl + 'user/updatePassword', {
    method: 'POST',
    body: params,
  });
}

//公共树
export async function queryCompanyTree(params) {
  return request(baseUrl + 'common/GetCompanyTree', {
    method: 'POST',
    body: params,
  });
}

//------------1数据总览---------------
// 基础信息
export async function queryStatisticsInfo(params) {
  return request(baseUrl + 'DashBoard/StatisticsInfo', {
    method: 'POST',
    body: params,
  });
}
// tab
export async function queryAddOilStatistics(params) {
  return request(baseUrl + 'DashBoard/AddOilStatistics', {
    method: 'POST',
    body: params,
  });
}
// 排行榜
export async function queryBranchAddOilStatistics(params) {
  return request(baseUrl + 'DashBoard/BranchAddOilStatistics', {
    method: 'POST',
    body: params,
  });
}
//------------2基础信息管理-----------
//------------2.1分公司管理-----------
// 获取分公司下拉框
export async function queryBasicinfoBranch(params) {
  return request(baseUrl + 'common/getBranchSelectList', {
    method: 'POST',
    body: params,
  });
}
// 获取分公司等级
export async function queryGetCompanyLevel(params) {
  return request(baseUrl + 'common/GetCompanyLevel', {
    method: 'POST',
    body: params,
  });
}
//分公司详情
export async function querySubsidiaryInfo(params) {
  return request(baseUrl + 'CompanyBranch/getCompanyBranchDetails', {
    method: 'POST',
    body: params,
  });
}
//编辑分公司
export async function queryUpdateSubsidiary(params) {
  return request(baseUrl + 'CompanyBranch/saveBranch', {
    method: 'POST',
    body: params,
  });
}

// 二级分公司新增公司判断
export async function queryGetUserData(params) {
  return request(baseUrl + 'Common/getUserData', {
    method: 'POST',
    body: params,
  });
}
//添加分公司
export async function queryAddSubsidiary(params) {
  return request(baseUrl + 'CompanyBranch/addBranch', {
    method: 'POST',
    body: params,
  });
}
//分公司分页列表
export async function queryBasicinfo1(params) {
  return request(baseUrl + 'CompanyBranch/selectBranchPage', {
    method: 'POST',
    body: params,
  });
}
//分公司查询页面搜索项(上级分公司下拉列表选项)默认值及新增分公司下拉选项初始化值
export async function queryBasicinfo1Branch(params) {
  return request(baseUrl + 'Common/GetBrachListSelect', {
    method: 'POST',
    body: params,
  });
}
//编辑分公司页面所属分公司下拉列表选项初始化值
export async function queryBasicinfo1BranchEdit(params) {
  return request(baseUrl + 'Common/getAffiliatedCompany', {
    method: 'POST',
    body: params,
  });
}

//------------2.2司机管理-----------
//司机查询
export async function queryBasicinfo2(params) {
  return request(baseUrl + 'driver/getDriverList', {
    method: 'POST',
    body: params,
  });
}
//司机新增
export async function queryBasicinfoDriverAdd(params) {
  return request(baseUrl + 'driver/addDriver', {
    method: 'POST',
    body: params,
  });
}
//司机删除
export async function queryBasicinfoDriverDel(params) {
  return request(baseUrl + 'driver/deleteDriver', {
    method: 'POST',
    body: params,
  });
}
//司机编辑页（司机详情）
export async function queryBasicinfoDriverInfo(params) {
  return request(baseUrl + 'driver/getDriverInfo', {
    method: 'POST',
    body: params,
  });
}
//司机编辑提交
export async function queryBasicinfoDriverUpdate(params) {
  return request(baseUrl + 'driver/updateDriver', {
    method: 'POST',
    body: params,
  });
}
//下载模板-司机查询
export async function querySubsidiaryDownloadTemplet(params) {
  return request(baseUrl + 'common/getTemplate', {
    method: 'POST',
    body: params,
  });
}
//司机导入-批量导入
export async function querySubsidiaryImportDriverInfo(params) {
  return request(baseUrl + 'driver/importDriverInfo', {
    method: 'POST',
    body: params,
  });
}
//获取异步上传文件已处理未读个数
export async function queryDingNotice(params) {
  return request(baseUrl + 'oilAccount/DingNotice', {
    method: 'POST',
    body: params,
  });
}
//异步文件未读消息列表
export async function queryNoticeList(params) {
  return request(baseUrl + 'oilAccount/noticeList', {
    method: 'POST',
    body: params,
  });
}


//------------2.3账号管理-----------
//角色查询列表
export async function queryAppRoleInfo(params) {
  return request(baseUrl + 'Application/getAppRoleList', {
    method: 'POST',
    body: params,
  });
}
//角色查询列表
export async function queryAppRoleOne(params) {
  return request(baseUrl + 'Application/getAppRoleOne', {
    method: 'POST',
    body: params,
  });
}
//角色编辑
export async function queryAppRoleSaveOne(params) {
  return request(baseUrl + 'Application/roleSaveOne', {
    method: 'POST',
    body: params,
  });
}
//角色权限菜单获取
export async function queryAppGetMenuRole(params) {
  return request(baseUrl + 'Application/getMenuRole', {
    method: 'POST',
    body: params,
  });
}
//新增角色
export async function querySetRoleAdd(params) {
  return request(baseUrl + 'Application/roleAddOne', {
    method: 'POST',
    body: params,
  });
}

//设置角色
export async function querySetRoleAuth(params) {
  return request(baseUrl + 'Application/setRoleAuth', {
    method: 'POST',
    body: params,
  });
}

//角色权限下拉菜单 包含选中的
export async function queryUsersRole(params) {
  return request(baseUrl + 'Application/getUsersRoleSelect', {
    method: 'POST',
    body: params,
  });
}

//角色权限下拉菜单 包含选中的
export async function queryDelRole(params) {
  return request(baseUrl + 'Application/roleDeleteOne', {
    method: 'POST',
    body: params,
  });
}

//------------3订单管理---------------
//获取订单列表
export async function querySearchOrder(params) {
  return request(baseUrl + 'search/searchOrder', {
    method: 'POST',
    body: params,
  });
}
//订单详情
export async function queryRetailOrderDetails(params) {
  return request(baseUrl + 'Order/getRetailOrderDetails', {
    method: 'POST',
    body: params,
  });
}

//------------4油费管理---------------
//帐户-获取油卡账户详情
export async function queryoilfee1(params) {
  return request(baseUrl + 'oilAccount/getOilAccountInfo', {
    method: 'POST',
    body: params,
  });
}
//帐户-公司账户流水明细（总公司/分公司）
export async function queryoilfee1List(params) {
  return request(baseUrl + 'oilAccount/OilAccountRunning', {
    method: 'POST',
    body: params,
  });
}
//帐户-公司账户流水明细导出（总公司/分公司）
export async function queryoilfee1ListExport(params) {
  return request(baseUrl + 'oilAccount/OilAccountRunning', {
    method: 'POST',
    body: params,
  });
}
//帐户-获取分公司油卡账户详情
export async function queryoilfee2(params) {
  return request(baseUrl + 'oilAccount/branchOAList', {
    method: 'POST',
    body: params,
  });
}
//帐户-公司账户流水明细（总公司/分公司
export async function queryoilfee2detail(params) {
  return request(baseUrl + 'oilAccount/OilAccountRunning', {
    method: 'POST',
    body: params,
  });
}
//帐户-获取公司等级
export async function queryoilfeeCompanyLevel(params) {
  return request(baseUrl + 'Common/GetCompanyLevel', {
    method: 'POST',
    body: params,
  });
}
//帐户-获取司机油卡账户详情列表
export async function queryoilfee3(params) {
  return request(baseUrl + 'oilAccount/DriverOAList', {
    method: 'POST',
    body: params,
  });
}
//帐户-获取司机油卡账户详情列表导出
export async function queryoilfee3Export(params) {
  return request(baseUrl + 'oilAccount/DriverOAList', {
    method: 'POST',
    body: params,
  });
}
//帐户-司机油卡账户收支明细
export async function queryoilfee3List(params) {
  return request(baseUrl + 'oilAccount/DriverOARunning', {
    method: 'POST',
    body: params,
  });
}
//帐户-司机油卡账户收支明细导出
export async function queryoilfee3ListExport(params) {
  return request(baseUrl + 'oilAccount/DriverOARunning', {
    method: 'POST',
    body: params,
  });
}
//帐户-（总/分）公司油费发放详情
export async function queryoilfee4List(params) {
  return request(baseUrl + 'oilAccount/OADistributeDetail', {
    method: 'POST',
    body: params,
  });
}
//帐户-（总/分）公司油费发放详情导出
export async function queryoilfee4ListExport(params) {
  return request(baseUrl + 'oilAccount/OADistributeDetail', {
    method: 'POST',
    body: params,
  });
}
//下载模板-油费发放
export async function queryoilfeeDownloadTemplet(params) {
  return request(baseUrl + 'common/getTemplate', {
    method: 'POST',
    body: params,
  });
}
//帐户-油费回收
export async function queryoilfeeRecover(params) {
  return request(baseUrl + 'oilAccount/OARecover', {
    method: 'POST',
    body: params,
  });
}
//添加发放计划
export async function queryoilfeeDistribute(params) {
  return request(baseUrl + 'oilAccount/OADistribute', {
    method: 'POST',
    body: params,
  });
}
//获取可回收油费
export async function queryoilfeeRecycle(params) {
  return request(baseUrl + 'oilAccount/OARecycle', {
    method: 'POST',
    body: params,
  });
}
//获取分公司列表
export async function queryoilfeeBranch(params) {
  return request(baseUrl + 'oilAccount/GetBranchList', {
    method: 'POST',
    body: params,
  });
}

//当前可发放油费的子公司,isAll=1获取全部
export async function queryoilfeeCompany(params) {
  return request(baseUrl + 'oilAccount/branchOAList', {
    method: 'POST',
    body: params,
  });
}
//当前可发放油费的司机,isAll=1获取全部
export async function queryoilfeeDriver(params) {
  return request(baseUrl + 'oilAccount/DriverOAList', {
    method: 'POST',
    body: params,
  });
}

//------------5结算管理---------------

//用户-用户列表
export async function queryBasicinfo3(params) {
  return request(baseUrl + 'user/getList', {
    method: 'POST',
    body: params,
  });
}
//用户-关闭用户
export async function queryCloseUser(params) {
  return request(baseUrl + 'user/closeUser', {
    method: 'POST',
    body: params,
  });
}
//用户-创建用户接口
export async function queryAddUser(params) {
  return request(baseUrl + 'user/addUser', {
    method: 'POST',
    body: params,
  });
}

// 所有网点
export async function querySkidList(params) {
  return request(baseUrl + 'common/getSkidList', {
    method: 'POST',
    body: params,
  });
}
// 用油类型
export async function queryGoodsList(params) {
  return request(baseUrl + 'common/getGoodsList', {
    method: 'POST',
    body: params,
  });
}

// 城市
export async function queryRegionList(params) {
  return request(baseUrl + 'common/getRegionList', {
    method: 'POST',
    body: params,
  });
}
// 重置密码
export async function queryResetPassword(params) {
  return request(baseUrl + 'user/resetPassword', {
    method: 'POST',
    body: params,
  });
}

// 结算列表
export async function queryBillList(params) {
  return request(baseUrl + 'bill/billlist', {
    method: 'POST',
    body: params,
  });
}
// 结算主体
export async function queryOwnCompanyList(params) {
  return request(baseUrl + 'common/getOwnCompanyList', {
    method: 'POST',
    body: params,
  });
}
//结算详情
export async function queryBillDetail(params) {
  return request(baseUrl + 'bill/billDetail', {
    method: 'POST',
    body: params,
  });
}
// 结算详情列表
export async function queryBillOrderList(params) {
  return request(baseUrl + 'bill/billOrderList', {
    method: 'POST',
    body: params,
  });
}

//------------角色权限---------------

// 用户详情
export async function queryUserInfo(params) {
  return request(baseUrl + 'user/getUserInfo', {
    method: 'POST',
    body: params,
  });
}
// 编辑用户
export async function queryUpdateUser(params) {
  return request(baseUrl + 'user/updateUser', {
    method: 'POST',
    body: params,
  });
}
export async function queryImportDriverInfo(params) {
  return request(baseUrl + 'driver/importDriverInfo', {
    method: 'POST',
    body: params,
    headers:{
      "Content-Type": "multipart/form-data"
    } 
  });
}

//------------数据报表--------------

// 日报表查询
export async function queryDailySheetLoad(params) {
  return request(baseUrl + 'StatReport/DayReport', {
    method: 'POST',
    body: params,
  });
}
// 日报表导出
export async function queryDailySheetDownLoad(params) {
  return request(baseUrl + 'StatReport/DayReportDown', {
    method: 'POST',
    body: params,
  });
}
// 月报表查询
export async function queryMonthlySheetLoad(params) {
  return request(baseUrl + 'StatReport/MonthReport', {
    method: 'POST',
    body: params,
  });
}
// 月报表导出
export async function queryMonthlySheetDownLoad(params) {
  return request(baseUrl + 'StatReport/MonthReportDown', {
    method: 'POST',
    body: params,
  });
}