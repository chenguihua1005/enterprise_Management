import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Row, Col, Card, Form, Tabs, Button, Table, Divider, Input, Icon } from 'antd';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from '../OilFee.less';

import AccountBranchDetailComponent from './BranchDetail';
import OilFeeRecycle from '../components/OilFeeRecycle';
import OilFeeGrantSingle from '../components/OilFeeGrantSingle';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch2'],
}))
@Form.create()
export default class AccountBranchComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 2;
    const panes = [{ title: '分公司账户', content: '', key: '1' }];
    this.state = {
      formValues: {},
      activeKey: panes[0].key,
      panes,
      recycleModalVisible: false,
      recycleInfo: {}, // 回收弹窗默认显示信息
      grantModalVisible: false, // 发放弹窗
      grantInfo: {},
    };
  }
  // 回收 modal 操作
  handleRecycleModalVisible = (status, info) => {
    this.setState({
      recycleModalVisible: status,
      recycleInfo: info,
    });
    console.log(this.state);
    //可回收余额
    this.props.dispatch({
      type: 'oilfee/fetchProvideRecycle',
      payload: {
        member_id: 26,
        grantType: 1,
        data: info.companyBranchId
      },
    });
  };
  // 发放弹窗 操作
  handleGrantModalVisible = (status, info) => {
    this.setState({
      grantModalVisible: status,
      grantInfo: info,
    });
  };
  componentDidMount() {
    const { dispatch } = this.props;
    //总账户详情
    dispatch({
      type: 'oilfee/fetch1',
      payload: { member_id: 26 },
    });
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
  }

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const params = {
      //默认值
      member_id: 26,
      page: 1,
      pageSize: 10,
      isCount: 1,
      mobilePhone: '',
      branchName: '',
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
        branchName: fieldsValue.branchName,
      };

      dispatch({
        type: 'oilfee/fetch2',
        payload: values,
      });
    });
  };
  // 搜索区表单
  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="分公司名称">{getFieldDecorator('branchName')(<Input />)}</FormItem>
          </Col>
          <Col md={12} sm={24} style={{ float: 'right' }}>
            <Button type="primary" htmlType="submit">
              <Icon type="search" />查询
            </Button>
            {/* <Button style={{ marginLeft: 10 }}>重置</Button> */}
          </Col>
        </Row>
      </Form>
    );
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      member_id: 26,
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
    };

    dispatch({
      type: 'oilfee/fetch2',
      payload: params,
    });
  };

  renderForm() {
    return this.renderAdvancedForm();
  }
  // 收支明细
  incomeAndExpense(record) {
    const panes = this.state.panes;
    let activeKey = `${this.newTabIndex++}`;
    // 保持仅有两个 tabs
    if (panes.length > 1) {
      panes.pop();
    }
    panes.push({
      title: '公司账户明细-预存账户',
      content: <AccountBranchDetailComponent companyId={record.companyBranchId} companyBranchName={record.companyBranchName}/>,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
    console.log(record.companyBranchId);
  }
  // 关闭 tabs
  remove = targetKey => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  // remove 触发器
  onEdit = (targetKey, action) => {
    console.log(action);
    this[action](targetKey);
  };

  render() {
    const { oilfee, loading } = this.props;
    const { oilBranchInfoList, oilAccountInfo } = oilfee;
    const { count, list: tabledata } = oilBranchInfoList;
    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };
    const columnData = [
      {
        title: '分公司名称',
        dataIndex: 'companyBranchName',
      },
      {
        title: '可用余额(元)',
        dataIndex: 'balance',
      },
      {
        title: '操作',
        key: 'prop3',
        render: (text, record) => (
          <span>
            <Button type="primary" onClick={() => this.handleGrantModalVisible(true, record)}>
              发放油费
            </Button>
            <Divider type="vertical" />
            <Button onClick={() => this.handleRecycleModalVisible(true, record)}>回收油费</Button>
            <Divider type="vertical" />
            <Button onClick={() => this.incomeAndExpense(record)}>账户收支明细</Button>
          </span>
        ),
      },
    ];

    const pageList = (
      <div>
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card bordered={false}>
              <div className={`${styles.tableListForm} ${styles.noMarginBottom}`}>
                {this.renderAdvancedForm()}
              </div>
            </Card>
          </Col>
        </Row>
        <Card bordered={false}>
          <div className={styles.tableList}>
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
      </div>
    );
    return (
      <PageHeaderLayout>
        <div
          className={this.state.panes.length > 1 ? styles.tabsWrapper : styles.tabsWrapperNoTabsBar}
        >
          <Tabs
            hideAdd
            onChange={this.onChange}
            activeKey={this.state.activeKey}
            type="editable-card"
            onEdit={this.onEdit}
          >
            {this.state.panes.map(
              pane =>
                pane.key == '1' ? (
                  <TabPane tab={pane.title} key="1" closable={false}>
                    {pageList}
                  </TabPane>
                ) : (
                  <TabPane tab={pane.title} key={pane.key} closable={true}>
                    {pane.content}
                  </TabPane>
                )
            )}
          </Tabs>
        </div>
        {/* 回收 */}
        <OilFeeRecycle
          modalVisible={this.state.recycleModalVisible}
          handleModalVisible={() => this.handleRecycleModalVisible(false, {})}
          recycleInfo={this.state.recycleInfo}
          grantType="motorcade"
        />
        {/* 发放油费 */}
        <OilFeeGrantSingle
          modalVisible={this.state.grantModalVisible}
          handleModalVisible={() => this.handleGrantModalVisible(false, {})}
          grantInfo={this.state.grantInfo}
          grantType="motorcade"
        />
      </PageHeaderLayout>
    );
  }
}
