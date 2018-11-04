import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select, message, Row, Col, Cascader } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import { getTimeDistance, isNum } from '../../../utils/utils';

@connect(({ oilfee }) => ({
  oilfee,
}))
@Form.create()
export default class OilFeeRecycleSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      recycleForm: {},
      rangePickerValue: getTimeDistance('month'),
      allMotorcade: [], // 所有的车队
      allDrivers: [], // 所有的司机
    };
  }

  componentDidMount() {
    const { form } = this.props;
    //重置控件
    form.resetFields();
  }

  // 确定后提交操作与关闭弹窗
  okHandle = (callback, grantType, branchOrDriverId, amount) => {
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    const startTime = startValue.format('YYYY-MM-DD');
    const endTime = endValue.format('YYYY-MM-DD');
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!isNum(amount)) {
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
        //重置控件
        form.resetFields();
        //重置被回收方
        this.setState({
          allMotorcade: [], // 所有的车队
          allDrivers: [], // 所有的司机
        });
        //重置可回收油费
        dispatch({
          type: 'oilfee/fetchProvideRecycleReset',
          payload: {},
        });
        //总账户详情
        dispatch({
          type: 'oilfee/fetch1',
          payload: {  },
        });
        //回收油费
        dispatch({
          type: 'oilfee/fetchProvideRecover',
          payload: {
            grantType: grantType == '2' ? 2 : 1,
            driverId: branchOrDriverId,
            branchId: branchOrDriverId,
            recoveryAmount: amount,
          },
        }).then(() => {
          const { provideRecover } = this.props.oilfee;
          switch (provideRecover.err) {
            //err=0成功
            case 0:
              message.success(provideRecover.msg);
              //更新发放明细列表
              //油费发放详情
              dispatch({
                type: 'oilfee/fetch4Detail',
                payload: {
                  page: 1,
                  pageSize: 10,
                  isCount: 1,
                  startTime,
                  endTime,
                },
              });
              break;
            default:
              message.warning(provideRecover.msg);
          }
        });
      }
    });
  };

  // 取消后提交操作与关闭弹窗
  cancelHandle = callback => {
    const { dispatch, form } = this.props;
    //重置可回收油费
    dispatch({
      type: 'oilfee/fetchProvideRecycleReset',
      payload: {},
    });
    //清掉"回收金额"数据
    form.resetFields();
    //重置被回收方
    this.setState({
      allMotorcade: [], // 所有的车队
      allDrivers: [], // 所有的司机
    });
    callback && callback();
  };

  // 选择回收对象
  handleObjectChange = value => {
    const { dispatch, form, oilfee } = this.props;
    // const { provideCompany, provideDriver } = oilfee;
    const { allMotorcade, allDrivers } = this.state;
    // const { getFieldValue } = form;
    //清空旧数据
    this.setState({
      allMotorcade: [],
      allDrivers: [],
    });
    form.resetFields('byRecycle');
    if (value == '2') {
      //司机
      //获取司机
      dispatch({
        type: 'oilfee/fetchProvideDriver',
        payload: {
          page: 1,
          pageSize: 10,
          isAll: 1,
          isRecover: 1,
        },
      }).then(() => {
        const { provideDriver } = this.props.oilfee;
        if (provideDriver != undefined && provideDriver.length > 0) {
          let allDrivers = [];
          //所有的司机
          provideDriver.forEach(item => {
            allDrivers.push(
              <Option
                value={`${item.employeeId},${item.employeeName},${item.employeeMobile},${
                  item.key
                },`}
                key={item.key}
              >
                {`${item.employeeName} ${item.employeeMobile}`}
              </Option>
            );
          });
          this.setState({
            allDrivers,
          });
        }
      });
    } else if (value == '1') {
      //公司
      //获取公司
      dispatch({
        type: 'oilfee/fetchProvideCompany',
        payload: {
          page: 1,
          pageSize: 10,
          isAll: 1,
        },
      }).then(() => {
        const { provideCompany } = this.props.oilfee;
        if (provideCompany != undefined && provideCompany.length > 0) {
          let allMotorcade = [];
          //所有的分公司
          provideCompany.forEach(item => {
            allMotorcade.push(
              <Option value={item.companyBranchId} key={item.companyBranchId}>
                {item.companyBranchName}
              </Option>
            );
          });
          this.setState({
            allMotorcade,
          });
        }
      });
    }
  };

  // 选择被回收方后
  handleSelectChange = value => {
    const { dispatch, form } = this.props;
    const { getFieldValue } = form;
    const grantType = getFieldValue('reObject');
    if (grantType == 2) {
      value = value.split(',')[0];
    }
    //获取可回收油费
    this.props.dispatch({
      type: 'oilfee/fetchProvideRecycle',
      payload: {
        grantType,
        data: value,
      },
    });
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
    const { getFieldDecorator, getFieldValue } = form;
    const { provideRecycle } = oilfee;
    const { provideCompany, provideDriver } = oilfee;
    const { allMotorcade, allDrivers } = this.state;
    // const companyBranchOrDriverId =
    //   grantType == 'driver' ? recycleInfo.employeeMobile : recycleInfo.companyBranchId;

    return (
      <Modal
        title="油费回收"
        visible={modalVisible}
        onOk={() =>
          this.okHandle(
            handleModalVisible,
            form.getFieldValue('reObject'),
            form.getFieldValue('byRecycle'),
            form.getFieldValue('reCount')
          )
        }
        width={650}
        onCancel={() => this.cancelHandle(handleModalVisible)}
        maskClosable={false}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="回收对象">
          {getFieldDecorator('reObject', {
            rules: [{ required: true, message: '请选择回收对象' }],
          })(
            <Select
              placeholder="请选择发放对象"
              style={{ width: '100%' }}
              onChange={this.handleObjectChange}
            >
              <Option value="1">分公司/车队</Option>
              <Option value="2">司机</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="被回收方">
          {getFieldDecorator('byRecycle', {
            rules: [{ required: true, message: '请选择被回收方' }],
          })(
            <Select
              placeholder="请选择发放对象"
              showSearch={true}
              style={{ width: '100%' }}
              onChange={this.handleSelectChange}
            >
              {getFieldValue('reObject') == '2' ? allDrivers : allMotorcade}
            </Select>
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
