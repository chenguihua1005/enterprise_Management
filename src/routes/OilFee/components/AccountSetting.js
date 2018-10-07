import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, message, Row, Col, Cascader } from 'antd';
const FormItem = Form.Item;

@Form.create()
export default class OilFeeDriverSetting extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      driverForm: {},
    };
  }
  // 确定后提交操作与关闭弹窗
  okHandle = callback => {
    callback && callback();
    console.log(123);
  };
  // 选择车牌所属地后的回调
  onChange = checked => {
    console.log(checked);
  };

  render() {
    const { form, modalVisible, handleModalVisible, dirverInfo } = this.props;
    const { getFieldDecorator } = form;
    const options = [
      {
        value: 'zhejiang',
        label: '浙',
        children: [
          {
            value: 'A',
            label: 'A',
          },
        ],
      },
      {
        value: 'jiangsu',
        label: '苏',
        children: [
          {
            value: 'B',
            label: 'B',
          },
        ],
      },
    ];
    return (
      <Modal
        title="账户设置"
        visible={modalVisible}
        onOk={() => this.okHandle(handleModalVisible)}
        width={850}
        onCancel={handleModalVisible}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="司机手机号">
              {getFieldDecorator('no')(<span>{dirverInfo.age}</span>)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="司机姓名">
              {getFieldDecorator('no')(<span>{dirverInfo.name}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="使用车牌号">
              {getFieldDecorator('carinfo', {
                rules: [{ required: true, message: '车牌信息不能为空' }],
              })(
                <div>
                  <Cascader
                    defaultValue={['zhejiang', 'A']}
                    options={options}
                    onChange={this.onChange}
                    style={{ width: 100 }}
                  />
                  <Input style={{ display: 'inline-block', width: 120 }} />
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}
