import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, message, Row, Col } from 'antd';
import { isNum } from '../../../utils/utils';
const FormItem = Form.Item;

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch2'],
}))
@Form.create()
export default class OilFeeGrantSingle extends PureComponent {
  // 给司机或者车队单独发油费
  constructor(props) {
    super(props);
    this.state = {
      grantForm: {},
    };
  }

  // 确定后提交操作与关闭弹窗
  okHandle = (callback, grantType, companyBranchOrDriverId, amount) => {
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!isNum(amount)) {
          message.warning('金额必须为数字');
          return;
        } else if (parseFloat(amount) <= 0) {
          message.warning('金额需大于0');
          return;
        } else if (parseFloat(amount) > parseFloat(this.props.oilfee.oilAccountInfo.accountAmount)) {
          message.warning('发放金额必须小于或等于可发放金额！');
          return;
        }
        callback && callback();
        let obj = {
          no: companyBranchOrDriverId,
          obj: companyBranchOrDriverId,
          amount: amount,
        };
        //发放油费
        dispatch({
          type: 'oilfee/fetchProvideDistribute',
          payload: {
            grantType: grantType == 'driver' ? 2 : 1,
            data: [obj],
          },
        }).then(() => {
          const { provideDistribute } = this.props.oilfee;
          switch (provideDistribute.err) {
            //err=0成功
            case 0:
              message.success(provideDistribute.msg);
              //发放完油费后，要去刷新"总账户"、"分公司账户"和"司机账户"页面数据
              //总账户详情
              dispatch({
                type: 'oilfee/fetch1',
                payload: {  },
              });
              //帐户-获取分公司油卡账户详情
              dispatch({
                type: 'oilfee/fetch2',
                payload: {
                  page: 1,
                  pageSize: 10,
                  isCount: 1,
                },
              });
              //帐户-获取司机油卡账户详情列表
              dispatch({
                type: 'oilfee/fetch3',
                payload: {
                  page: 1,
                  pageSize: 10,
                  isCount: 1,
                },
              });
              break;
            default:
              message.warning(provideDistribute.msg);
          }
          //清掉"发放金额"数据
          form.resetFields('grantCount');
        });
      }
    });
  };

  // 取消后提交操作与关闭弹窗
  cancelHandle = callback => {
    const { form } = this.props;
    //清掉"发放金额"数据
    form.resetFields('grantCount');
    callback && callback();
  };

  // 选择车牌所属地后的回调
  onChange = checked => {
    // console.log(checked);
  };

  render() {
    const { form, modalVisible, handleModalVisible, grantInfo, oilfee, grantType } = this.props;
    const { oilAccountInfo } = oilfee;
    const { getFieldDecorator } = form;
    const companyBranchOrDriverId =
      grantType == 'driver' ? grantInfo.employeeId : grantInfo.companyBranchId;
    return (
      <Modal
        title="发放油费"
        visible={modalVisible}
        onOk={() =>
          this.okHandle(
            handleModalVisible,
            grantType,
            companyBranchOrDriverId,
            form.getFieldValue('grantCount')
          )
        }
        width={850}
        onCancel={() => this.cancelHandle(handleModalVisible)}
        maskClosable={false}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="发放对象">
              {getFieldDecorator('prop1')(
                grantType == 'driver' ? <span>司机</span> : <span>车队/分公司</span>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="可发放金额">
              {getFieldDecorator('prop2')(<span>{oilAccountInfo.accountAmount}</span>)}
            </FormItem>
          </Col>
        </Row>
        {/* 司机账户才会有下面的信息 */}
        {grantType == 'driver' ? (
          <Row gutter={24}>
            <Col span={12}>
              <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="司机手机号">
                {getFieldDecorator('prop3')(<span>{grantInfo.employeeMobile}</span>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="使用车牌号">
                {getFieldDecorator('prop4')(<span>-</span>)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row gutter={24}>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="账户余额">
              {getFieldDecorator('prop5')(<span>{grantInfo.balance}</span>)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="发放金额(元)">
              {getFieldDecorator('grantCount', {
                defaultValue: '',
                rules: [{ required: true, message: '请输入发放金额' }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}
