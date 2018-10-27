import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select, message, Row, Col, Cascader } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ oilfee }) => ({
  oilfee,
}))
@Form.create()
export default class OilFeeRecycle extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      recycleForm: {},
    };
  }

  IsNum = s => {
    let re = /^(\-|\+)?\d+(\.\d+)?$/; //判断字符串是否为数字
    if (!re.test(s)) {
      return false;
    } else return true;
  };

  // 确定后提交操作与关闭弹窗
  okHandle = (callback, grantType, companyBranchOrDriverId, amount) => {
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!this.IsNum(amount)) {
          message.warning('金额必须为数字');
          return;
        } else if (parseFloat(amount) <= 0) {
          message.warning('金额需大于0');
          return;
        } else if (parseFloat(amount) > parseFloat(this.props.oilfee.provideRecycle.money)) {
          message.warning('回收金额必须小于或等于可回收金额！');
          return;
        }
        callback && callback();
        //回收油费
        dispatch({
          type: 'oilfee/fetchProvideRecover',
          payload: {
            member_id: 26,
            grantType: grantType == 'driver' ? 2 : 1,
            driverId: companyBranchOrDriverId,
            branchId: companyBranchOrDriverId,
            recoveryAmount: amount,
          },
        }).then(() => {
          const { provideRecover } = this.props.oilfee;
          switch (provideRecover.err) {
            //err=0成功
            case 0:
              message.success(provideRecover.msg);
              break;
            default:
              message.warning(provideRecover.msg);
          }
          //清掉"回收金额"数据
          form.resetFields('reCount');
          //发放完油费后，要去刷新"分公司账户"和"司机账户"页面数据
          //帐户-获取分公司油卡账户详情
          dispatch({
            type: 'oilfee/fetch2',
            payload: {
              member_id: 26,
              page: 1,
              pageSize: 10,
              isCount: 1,
            },
          });
          //帐户-获取司机油卡账户详情列表
          dispatch({
            type: 'oilfee/fetch3',
            payload: {
              member_id: 26,
              page: 1,
              pageSize: 10,
              isCount: 1,
            },
          });
        });
      }
    });
  };

    // 取消后提交操作与关闭弹窗
    cancelHandle = callback => {
      const { form } = this.props;
      //清掉"回收金额"数据
      form.resetFields('reCount');
      callback && callback();
    };

  // 选择车牌所属地后的回调
  onChange = checked => {
    console.log(checked);
  };

  render() {
    const {
      form,
      modalVisible,
      handleModalVisible,
      recycleInfo = {},
      oilfee,
      grantType,
    } = this.props;
    const { getFieldDecorator } = form;
    const { provideRecycle } = oilfee;
    const companyBranchOrDriverId =
      grantType == 'driver' ? recycleInfo.employeeId : recycleInfo.companyBranchId;

    return (
      <Modal
        title="油费回收"
        visible={modalVisible}
        onOk={() =>
          this.okHandle(
            handleModalVisible,
            grantType,
            companyBranchOrDriverId,
            form.getFieldValue('reCount')
          )
        }
        width={650}
        onCancel={() => this.cancelHandle(handleModalVisible)}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="回收对象">
          {getFieldDecorator('reObject')(
            grantType == 'driver' ? <span>司机</span> : <span>车队/分公司</span>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="被回收方">
          {getFieldDecorator('byRecycle')(
            grantType == 'driver' ? (
              <span>{recycleInfo.employeeMobile}</span>
            ) : (
              <span>{recycleInfo.companyBranchName}</span>
            )
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="可回收金额">
          {getFieldDecorator('reTotal')(<span>{provideRecycle.money}</span>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="回收金额">
          {getFieldDecorator('reCount', {
            rules: [{ required: true, message: '请输入回收金额' }],
          })(<Input placeholder="请输入回收金额" />)}
        </FormItem>
      </Modal>
    );
  }
}
