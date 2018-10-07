import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select, message, Row, Col, Cascader } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ oilfee }) => ({
  oilfee,
}))
@Form.create()
export default class OilFeeRecycleSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.allMotorcade = []; // 所有的车队
    this.allDrivers = []; // 所有的司机
    this.state = {
      recycleForm: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    //获取公司
    dispatch({
      type: 'oilfee/fetchProvideCompany',
      payload: {
        member_id: 26,
        page: 1,
        pageSize: 10,
        isAll: 1,
      },
    });
    //获取司机
    dispatch({
      type: 'oilfee/fetchProvideDriver',
      payload: {
        member_id: 26,
        page: 1,
        pageSize: 10,
        isAll: 1,
      },
    });
  }

  // 确定后提交操作与关闭弹窗
  okHandle = (callback, grantType, branchOrDriverId, amount) => {
    callback && callback();
    const { dispatch } = this.props;
    //回收油费
    dispatch({
      type: 'oilfee/fetchProvideRecover',
      payload: {
        member_id: 26,
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
          break;
        default:
          message.warning(provideRecover.msg);
      }
    });

  };
  // 选择车牌所属地后的回调
  onChange = checked => {
    console.log(checked);
  };

  // 选择回收对象
  handleObjectChange = value => {
    const { dispatch, form } = this.props;
    const { getFieldValue } = form;
    form.resetFields('byRecycle');
  };
  // 选择被回收方后
  handleSelectChange = value => {
    const { dispatch, form } = this.props;
    const { getFieldValue } = form;
    const grantType = getFieldValue('reObject');

    //获取可回收油费
    this.props.dispatch({
      type: 'oilfee/fetchProvideRecycle',
      payload: {
        member_id: 26,
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

    if (provideCompany != undefined && provideCompany.length > 0) {
      //所有的分公司
      this.allMotorcade = [];
      provideCompany.forEach(item => {
        this.allMotorcade.push(
          <Option value={item.companyBranchId} key={item.companyBranchId}>{item.companyBranchName}</Option>
        );
      });
    }
    if (provideCompany != undefined && provideCompany.length > 0) {
      //所有的司机
      this.allDrivers = [];
      provideDriver.forEach(item => {
        this.allDrivers.push(<Option value={item.employeeId} key={item.employeeId}>{item.employeeMobile}</Option>);
      });
    }

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
        onCancel={handleModalVisible}
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
              style={{ width: '100%' }}
              onChange={this.handleSelectChange}
            >
              {getFieldValue('reObject') == '2' ? this.allDrivers : this.allMotorcade}
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="可回收金额">
          {getFieldDecorator('reTotal')(<span>{provideRecycle.money}</span>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} label="回收金额">
          {getFieldDecorator('reCount', {
            rules: [{ required: true, message: '请输入回收金额' }],
          })(<Input type="number" placeholder="请输入回收金额" />)}
        </FormItem>
      </Modal>
    );
  }
}
