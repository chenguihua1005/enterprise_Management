import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Select, Button, Table, DatePicker, Icon, message } from 'antd';

const { RangePicker } = DatePicker;
const { Meta } = Card;

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from '../OilFee.less';

const FormItem = Form.Item;
const { Option } = Select;
import moment from 'moment';
import { getTimeDistance } from '../../../utils/utils';

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch1List','oilfee/fetch1ListExport'],
}))
@Form.create()
export default class AccountGeneralComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.branchId = -1;
  }

  state = {
    modalVisible: false,
    formValues: {},
    rangePickerValue: getTimeDistance('month'),
  };

  componentDidMount() {
    const { dispatch } = this.props;
    //总账户详情
    dispatch({
      type: 'oilfee/fetch1',
      payload: { member_id: 26 },
    }).then(() => {
      const { oilAccountInfo } = this.props.oilfee;
      const { companyType, belongCompanyId } = oilAccountInfo;
      //companyType=1:总公司, branchId传0
      //companyType=2:分公司, belongCompanyId为分公司ID
      this.branchId = companyType == 1 ? 0 : belongCompanyId;
      //总账户收支明细
      dispatch({
        type: 'oilfee/fetch1List',
        payload: {
          member_id: 26,
          branchId: this.branchId,
          page: 1,
          pageSize: 10,
          isCount: 1,
        },
      });
    });
  }

  //翻页，需要传branchid
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      member_id: 26,
      branchId: this.branchId,
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
    };

    dispatch({
      type: 'oilfee/fetch1List',
      payload: params,
    });
  };

  // 重置搜索条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'oilfee/fetch',
      payload: {},
    });
  };

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        //默认值
        member_id: 26,
        //branchId为0为查询总公司
        branchId: this.branchId,
        page: 1,
        pageSize: 10,
        isCount: 1,
        startTime,
        endTime,
        transactionType: 0,
        direction: 0,
      };

      // 表单校验
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        for (const prop in fieldsValue) {
          if (
            fieldsValue[prop] === '' ||
            fieldsValue[prop] === '全部' ||
            fieldsValue[prop] === undefined
          ) {
            delete fieldsValue[prop];
          }
        }

        const values = {
          ...params,
          transactionType: fieldsValue.transactionType,
          direction: fieldsValue.direction,
        };

        dispatch({
          type: 'oilfee/fetch1List',
          payload: values,
        });
      });
    } else {
      message.error('日期不能为空');
    }
  };

  //禁用当前日期之后的时间
  disabledDate = current => {
    // console.log(moment().subtract(3,"months"));
    // return current && current < moment().subtract(3,"months");
    return current && current > moment().endOf('day');
  };

  //日期框设置值
  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };

  //导出
  handleExport = () => {
    console.log('handleExport');
    const { dispatch, form } = this.props;
    const { getFieldValue } = form;
    const { rangePickerValue } = this.state;
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        //branchId为0为查询总公司
        actionType: 1,
        branchId: this.branchId,
        startTime,
        endTime,
        transactionType: 0,
        direction: 0,
      };
      const values = {
        ...params,
        transactionType: getFieldValue('transactionType'),
        direction: getFieldValue('direction'),
      };
      dispatch({
        type: 'oilfee/fetch1ListExport',
        payload: values,
      }).then(() => {
        const { oilAccountInfoListExport } = this.props.oilfee;
        switch (oilAccountInfoListExport.err) {
          //err=0成功
          case 0:
            message.success(oilAccountInfoListExport.msg);
            window.open(oilAccountInfoListExport.res.path);
            break;
          default:
            message.warning(oilAccountInfoListExport.msg);
        }
      });
    } else {
      message.error('日期不能为空');
    }
  };

  // 搜索区表单
  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="交易类型">
              {getFieldDecorator('transactionType', {
                initialValue: '0',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">全部</Option>
                  <Option value="1">充值</Option>
                  <Option value="2">发放油费</Option>
                  <Option value="3">回收</Option>
                  <Option value="4">加油</Option>
                  <Option value="5">退款</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="资金方向">
              {getFieldDecorator('direction', {
                initialValue: '0',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">全部</Option>
                  <Option value="1">收入</Option>
                  <Option value="2">支出</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="起止日期">
              {getFieldDecorator('range-picke')(
                // < onChange={onChange} />
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={this.disabledDate}
                  onChange={this.handleRangePickerChange}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              <Icon type="search" />查询
            </Button>
            {/* <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button> */}
            <Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
              <Icon type="export" />导出
            </Button>
          </span>
        </div>
      </Form>
    );
  }

  render() {
    const { oilfee, loading } = this.props;
    const { oilAccountInfo, oilAccountInfoList } = oilfee;
    const { count, list: tabledata } = oilAccountInfoList;
    const { companyLevel } = oilAccountInfo; //"companyLevel":["王二乙分公司一","王二乙企业后台集团有限公司"]
    let companyNames = '';
    if (companyLevel != undefined) {
      for (let i = companyLevel.length - 1; i >= 0; i--) {
        if (i == 0) {
          companyNames += companyLevel[i];
        } else companyNames += companyLevel[i] + ' / ';
      }
    }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };
    //React 需要的 key，如果已经设置了唯一的 dataIndex，可以忽略这个属性
    const columnData = [
      {
        title: '交易时间',
        dataIndex: 'createTime',
      },
      {
        title: '交易类型',
        dataIndex: 'transactionType',
      },
      {
        title: '金额(元)',
        dataIndex: 'rechargeAmount',
      },
      {
        title: '资金方向',
        dataIndex: 'direction',
      },
      {
        title: '交易后账户余额(元)',
        dataIndex: 'afterAmount',
      },
      {
        title: '交易方标识',
        dataIndex: 'transactionFlag',
      },
      {
        title: '账户交易流水号',
        dataIndex: 'flowNumber',
      },
    ];

    return (
      <PageHeaderLayout>
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card title={oilAccountInfo.accountType}>
              <Meta
                title={`${companyNames}`}
                description={`当前可用余额${oilAccountInfo.accountAmount}元`}
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} title="账户收支明细查询">
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            <Table
              pagination={paginationProps}
              loading={loading}
              rowKey={'key'}
              dataSource={tabledata}
              columns={columnData}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
